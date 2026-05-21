import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

import type { TopLevelCategory } from '../feedback.constants';

/**
 * Feedback Entity
 *
 * One row per submitted piece of feedback, from the website widget or
 * the mobile app. Mirrors the `feedback-widget` `FeedbackPayload` wire
 * contract plus a server-side `created_at`.
 *
 * Database: SQLite (`feedback` table). Persisted from day one (no
 * demo-only path). No backend consent gate at v0.1 — consent is
 * client-side per ADR-0003 (backend sync is the v0.2 roadmap).
 *
 * @class Feedback
 */
@Entity('feedback')
@Index(['project_id'])
@Index(['created_at'])
export class Feedback {
  /** Auto-generated UUID primary key. */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Source project identifier (e.g. `brasse-bouillon-website`). */
  @Column({ type: 'varchar', length: 100 })
  project_id: string;

  /** Top-level feedback category. */
  @Column({ type: 'varchar', length: 20 })
  category: TopLevelCategory;

  /** Sub-category; null for the `other` category. */
  @Column({ type: 'varchar', length: 40, nullable: true })
  sub_category: string | null;

  /** Free-text user message. Treated as potentially-PII content. */
  @Column({ type: 'text' })
  message: string;

  /** URL the feedback was sent from. */
  @Column({ type: 'varchar', length: 2048 })
  url: string;

  /** Referrer URL, when available. */
  @Column({ type: 'varchar', length: 2048, nullable: true })
  referrer: string | null;

  /** Browser/device user agent string. */
  @Column({ type: 'varchar', length: 512 })
  user_agent: string;

  /** Viewport width in CSS pixels. */
  @Column({ type: 'integer' })
  viewport_w: number;

  /** Viewport height in CSS pixels. */
  @Column({ type: 'integer' })
  viewport_h: number;

  /** Reporter locale (e.g. `fr-FR`). */
  @Column({ type: 'varchar', length: 20 })
  locale: string;

  /** Client-set submission timestamp (distinct from `created_at`). */
  @Column({ type: 'datetime' })
  client_timestamp: Date;

  /** Widget version that produced the payload. */
  @Column({ type: 'varchar', length: 40 })
  widget_version: string;

  /** Scroll depth ratio in [0, 1] at submission time. */
  @Column({ type: 'real' })
  scroll_depth: number;

  /** Opaque client session identifier. */
  @Column({ type: 'varchar', length: 128 })
  session_id: string;

  /** Server-side creation timestamp. */
  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
