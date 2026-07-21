import { Cron, CronExpression } from '@nestjs/schedule';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, LessThanOrEqual } from 'typeorm';
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';

import { BatchOrmEntity } from '../../batch/entities/batch.orm.entity';
import { RecipeOrmEntity } from '../../recipe/entities/recipe.orm.entity';
import { RecipeVisibility } from '../../recipe/domain/enums/recipe-visibility.enum';
import { ScanLabelImageOrmEntity } from '../../scan/entities/scan-label-image.orm.entity';
import { ScanRequestOrmEntity } from '../../scan/entities/scan-request.orm.entity';
import { DELETED_AUTHOR_ID } from '../../database/seeds/deleted-author.seed';
import { User } from '../entities/user.entity';
import { AccountDeletionScheduleDto } from '../dtos/account-deletion.dto';

const SCAN_UPLOAD_DIRECTORY = resolve(process.cwd(), 'uploads/scan-labels');
export const ACCOUNT_DELETION_GRACE_PERIOD_DAYS = 30;

type StoredScanImageRow = {
  file_path: string;
};

/**
 * Owns the transactional data-rights workflow for an authenticated account.
 * UserService.delete remains the smaller admin CRUD operation; this service
 * handles the complete user-owned aggregate boundary and public authorship
 * anonymization required by ADR-0012.
 */
@Injectable()
export class AccountDeletionService {
  private readonly logger = new Logger(AccountDeletionService.name);

  constructor(private readonly dataSource: DataSource) {}

  async requestDeletion(
    userId: string,
    now = new Date(),
  ): Promise<AccountDeletionScheduleDto> {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Account not found');
      }

      // Idempotent for ANY pending request, including one already past
      // due: rescheduling a due deletion would reopen the cancellation
      // window that cancelDeletion deliberately closes, and would race
      // with the expiry worker.
      if (user.deletion_requested_at && user.deletion_scheduled_for) {
        return this.toScheduleDto(user);
      }

      const scheduledFor = new Date(now);
      scheduledFor.setUTCDate(
        scheduledFor.getUTCDate() + ACCOUNT_DELETION_GRACE_PERIOD_DAYS,
      );

      await manager.update(User, userId, {
        deletion_requested_at: now,
        deletion_scheduled_for: scheduledFor,
      });

      return {
        status: 'scheduled',
        requested_at: now,
        scheduled_for: scheduledFor,
        grace_period_days: ACCOUNT_DELETION_GRACE_PERIOD_DAYS,
      };
    });
  }

  async cancelDeletion(userId: string, now = new Date()): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Account not found');
      }

      if (!user.deletion_scheduled_for) {
        return;
      }

      if (user.deletion_scheduled_for <= now) {
        throw new ConflictException('Account deletion is already due');
      }

      await manager.update(User, userId, {
        deletion_requested_at: null,
        deletion_scheduled_for: null,
      });
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async processDueDeletions(): Promise<void> {
    const now = new Date();
    let dueUsers: User[];
    try {
      // Repository find (not raw SQL): better-sqlite3 cannot bind a Date
      // parameter directly; TypeORM converts it to the stored datetime
      // format through the column metadata.
      dueUsers = await this.dataSource.getRepository(User).find({
        select: { id: true },
        where: { deletion_scheduled_for: LessThanOrEqual(now) },
      });
    } catch (error) {
      this.logger.error(
        `Could not list due account deletions: ${String(error)}`,
      );
      return;
    }

    for (const { id } of dueUsers) {
      try {
        await this.deleteAccount(id, now);
      } catch (error) {
        // One failed account must not block the other due deletions.
        this.logger.error(
          `Scheduled account deletion failed for user ${id}: ${String(error)}`,
        );
      }
    }
  }

  /**
   * Erases the user's private aggregate and anonymizes public authorship.
   * When `onlyIfDueAt` is provided (expiry-worker path), the deletion is
   * re-checked inside the transaction and skipped if it was canceled or
   * is no longer due — closing the race between the worker's due-users
   * snapshot and a concurrent cancellation.
   */
  async deleteAccount(userId: string, onlyIfDueAt?: Date): Promise<void> {
    const { deleted, imagePaths } = await this.dataSource.transaction(
      async (manager) => {
        const user = await manager.findOne(User, { where: { id: userId } });
        if (!user) {
          return { deleted: false, imagePaths: [] };
        }

        if (
          onlyIfDueAt &&
          (!user.deletion_scheduled_for ||
            user.deletion_scheduled_for > onlyIfDueAt)
        ) {
          return { deleted: false, imagePaths: [] };
        }

        // Batches must go before the private recipes: `batches.recipe_id`
        // references `recipes(id)` ON DELETE RESTRICT, so a batch still
        // pointing at a recipe we are about to delete would abort the whole
        // erasure transaction. Removing the user's batches first clears that
        // reference.
        const ownedBatches = await manager.find(BatchOrmEntity, {
          select: { id: true },
          where: { owner_id: userId },
        });
        const batchIds = ownedBatches.map((batch) => batch.id);
        await this.deleteBatchDependents(manager, batchIds);
        await this.deleteByIds(manager, 'batches', 'id', batchIds);

        const ownedRecipes = await manager.find(RecipeOrmEntity, {
          select: { id: true, visibility: true },
          where: { owner_id: userId },
        });
        const privateRecipeIds = ownedRecipes
          .filter((recipe) => recipe.visibility !== RecipeVisibility.PUBLIC)
          .map((recipe) => recipe.id);

        await this.deleteRecipeDependents(manager, privateRecipeIds);
        // Safe today: `recipes.root_recipe_id` is ON DELETE RESTRICT and
        // self-referencing, but every live recipe roots to itself (recipe
        // forking is not yet wired). Once a user can own a multi-version
        // lineage, deleting it in one bulk statement will hit the same
        // RESTRICT abort we fixed for batches above and will need ordered
        // deletion here.
        await this.deleteByIds(manager, 'recipes', 'id', privateRecipeIds);
        await manager
          .createQueryBuilder()
          .update(RecipeOrmEntity)
          .set({ owner_id: DELETED_AUTHOR_ID })
          .where('owner_id = :userId AND visibility = :visibility', {
            userId,
            visibility: RecipeVisibility.PUBLIC,
          })
          .execute();

        await this.deleteByOwner(manager, 'equipment_profiles', userId);
        await this.deleteByOwner(manager, 'label_drafts', userId);

        const ownedScans = await manager.find(ScanRequestOrmEntity, {
          select: { id: true },
          where: { owner_id: userId },
        });
        const scanIds = ownedScans.map((scan) => scan.id);
        const storedImages = scanIds.length
          ? await manager
              .createQueryBuilder(ScanLabelImageOrmEntity, 'image')
              .select('image.file_path', 'file_path')
              .where('image.scan_request_id IN (:...scanIds)', { scanIds })
              .getRawMany<StoredScanImageRow>()
          : [];
        await this.deleteByIds(
          manager,
          'scan_label_images',
          'scan_request_id',
          scanIds,
        );
        await this.deleteByIds(
          manager,
          'scan_review_queue',
          'scan_request_id',
          scanIds,
        );
        await this.deleteByIds(manager, 'scan_requests', 'id', scanIds);

        await manager.delete(User, { id: userId });
        return {
          deleted: true,
          imagePaths: storedImages.map((image) => image.file_path),
        };
      },
    );

    if (!deleted) {
      return;
    }

    await this.removeStoredImages(imagePaths);
    this.logger.log(`Account data deleted for user ${userId}`);
  }

  private toScheduleDto(user: User): AccountDeletionScheduleDto {
    if (!user.deletion_requested_at || !user.deletion_scheduled_for) {
      throw new Error('Incomplete deletion schedule');
    }

    return {
      status: 'scheduled',
      requested_at: user.deletion_requested_at,
      scheduled_for: user.deletion_scheduled_for,
      grace_period_days: ACCOUNT_DELETION_GRACE_PERIOD_DAYS,
    };
  }

  private async deleteByOwner(
    manager: EntityManager,
    table: string,
    ownerId: string,
  ): Promise<void> {
    await manager
      .createQueryBuilder()
      .delete()
      .from(table)
      .where('owner_id = :ownerId', { ownerId })
      .execute();
  }

  private async deleteByIds(
    manager: EntityManager,
    table: string,
    column: string,
    ids: string[],
  ): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    await manager
      .createQueryBuilder()
      .delete()
      .from(table)
      .where(`${column} IN (:...ids)`, { ids })
      .execute();
  }

  private async deleteRecipeDependents(
    manager: EntityManager,
    recipeIds: string[],
  ): Promise<void> {
    const dependentTables = [
      'recipe_steps',
      'recipe_fermentables',
      'recipe_hops',
      'recipe_yeasts',
      'recipe_additives',
      'recipe_water',
    ];

    for (const table of dependentTables) {
      await this.deleteByIds(manager, table, 'recipe_id', recipeIds);
    }
  }

  private async deleteBatchDependents(
    manager: EntityManager,
    batchIds: string[],
  ): Promise<void> {
    const dependentTables = [
      'batch_alerts',
      'batch_reminders',
      'batch_steps',
      'batch_measurements',
      'batch_observations',
      'batch_tastings',
    ];

    for (const table of dependentTables) {
      await this.deleteByIds(manager, table, 'batch_id', batchIds);
    }
  }

  private async removeStoredImages(filePaths: string[]): Promise<void> {
    await Promise.all(
      filePaths.map(async (filePath) => {
        const absolutePath = resolve(process.cwd(), filePath);
        if (!absolutePath.startsWith(`${SCAN_UPLOAD_DIRECTORY}/`)) {
          this.logger.warn(`Skipped unsafe scan image path: ${filePath}`);
          return;
        }

        try {
          await fs.rm(absolutePath, { force: true });
        } catch (error) {
          this.logger.warn(
            `Could not remove scan image ${filePath}: ${String(error)}`,
          );
        }
      }),
    );
  }
}
