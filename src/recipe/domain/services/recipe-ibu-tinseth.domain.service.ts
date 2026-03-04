import { RecipeHopAdditionStage } from '../enums/recipe-hop-addition-stage.enum';
import { RecipeHopType } from '../enums/recipe-hop-type.enum';

export interface TinsethHopInput {
  readonly hopId: string;
  readonly variety: string;
  readonly type: RecipeHopType;
  readonly additionStage: RecipeHopAdditionStage;
  readonly additionTimeMin?: number | null;
  readonly weightG: number;
  readonly alphaAcidPercent?: number | null;
}

export interface TinsethInput {
  readonly batchSizeL: number;
  readonly og: number;
  readonly boilTimeMin?: number | null;
  readonly hops: readonly TinsethHopInput[];
}

export interface TinsethHopResult {
  readonly hopId: string;
  readonly variety: string;
  readonly type: RecipeHopType;
  readonly additionStage: RecipeHopAdditionStage;
  readonly additionTimeMin: number | null;
  readonly weightG: number;
  readonly alphaAcidPercent: number | null;
  readonly utilization: number;
  readonly ibu: number;
}

export interface TinsethResult {
  readonly ibu: number;
  readonly hops: readonly TinsethHopResult[];
}

/**
 * Pure domain service implementing Tinseth bitterness estimation.
 */
export class RecipeIbuTinsethDomainService {
  calculate(input: TinsethInput): TinsethResult {
    const hops = input.hops.map((hop) =>
      this.calculateHop(hop, input.batchSizeL, input.og, input.boilTimeMin),
    );

    const ibu = this.round(
      hops.reduce((total, hop) => total + hop.ibu, 0),
      2,
    );

    return { ibu, hops };
  }

  private calculateHop(
    hop: TinsethHopInput,
    batchSizeL: number,
    og: number,
    boilTimeMin?: number | null,
  ): TinsethHopResult {
    const normalizedBatchSize = this.normalizePositiveNumber(batchSizeL);
    const normalizedWeight = this.normalizePositiveNumber(hop.weightG);
    const normalizedAlphaAcid = this.normalizePositiveNumber(
      hop.alphaAcidPercent,
    );
    const resolvedTime = this.resolveTime(
      hop.additionStage,
      hop.additionTimeMin,
      boilTimeMin,
    );

    const stageMultiplier = this.getStageMultiplier(hop.additionStage);
    const typeMultiplier = this.getTypeMultiplier(hop.type);

    if (
      normalizedBatchSize === 0 ||
      normalizedWeight === 0 ||
      normalizedAlphaAcid === 0 ||
      resolvedTime === 0 ||
      stageMultiplier === 0
    ) {
      return {
        hopId: hop.hopId,
        variety: hop.variety,
        type: hop.type,
        additionStage: hop.additionStage,
        additionTimeMin: hop.additionTimeMin ?? null,
        weightG: hop.weightG,
        alphaAcidPercent: hop.alphaAcidPercent ?? null,
        utilization: 0,
        ibu: 0,
      };
    }

    const baseUtilization = this.calculateTinsethUtilization(og, resolvedTime);
    const utilization = baseUtilization * stageMultiplier * typeMultiplier;
    const alphaAcidMassMg =
      normalizedWeight * (normalizedAlphaAcid / 100) * 1000;
    const ibu = (alphaAcidMassMg * utilization) / normalizedBatchSize;

    return {
      hopId: hop.hopId,
      variety: hop.variety,
      type: hop.type,
      additionStage: hop.additionStage,
      additionTimeMin: hop.additionTimeMin ?? null,
      weightG: hop.weightG,
      alphaAcidPercent: hop.alphaAcidPercent ?? null,
      utilization: this.round(utilization, 4),
      ibu: this.round(ibu, 2),
    };
  }

  private calculateTinsethUtilization(og: number, timeMin: number): number {
    const normalizedOg = Math.max(1, og);
    const normalizedTime = this.normalizePositiveNumber(timeMin);
    const bignessFactor = 1.65 * Math.pow(0.000125, normalizedOg - 1);
    const boilTimeFactor = (1 - Math.exp(-0.04 * normalizedTime)) / 4.15;

    return bignessFactor * boilTimeFactor;
  }

  private resolveTime(
    stage: RecipeHopAdditionStage,
    additionTimeMin?: number | null,
    boilTimeMin?: number | null,
  ): number {
    const hopTime = this.normalizePositiveNumber(additionTimeMin);
    const recipeBoilTime = this.normalizePositiveNumber(boilTimeMin);

    switch (stage) {
      case RecipeHopAdditionStage.DRY_HOP:
        return 0;
      case RecipeHopAdditionStage.WHIRLPOOL:
        return hopTime;
      case RecipeHopAdditionStage.BOIL:
      case RecipeHopAdditionStage.FIRST_WORT:
        return hopTime || recipeBoilTime;
      default:
        return hopTime;
    }
  }

  private getStageMultiplier(stage: RecipeHopAdditionStage): number {
    switch (stage) {
      case RecipeHopAdditionStage.BOIL:
        return 1;
      case RecipeHopAdditionStage.FIRST_WORT:
        return 1.1;
      case RecipeHopAdditionStage.WHIRLPOOL:
        return 0.5;
      case RecipeHopAdditionStage.DRY_HOP:
        return 0;
      default:
        return 1;
    }
  }

  private getTypeMultiplier(type: RecipeHopType): number {
    switch (type) {
      case RecipeHopType.PELLET:
        return 1.1;
      case RecipeHopType.WHOLE_LEAF:
        return 1;
      case RecipeHopType.EXTRACT:
        return 1.15;
      default:
        return 1;
    }
  }

  private normalizePositiveNumber(value?: number | null): number {
    if (value === null || value === undefined || !Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, value);
  }

  private round(value: number, decimals: number): number {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  }
}
