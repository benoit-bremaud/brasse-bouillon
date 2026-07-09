import {
  BadGatewayException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { WaterConfig } from '../../config/water.config';
import { WATER_CONFIG, WATER_PROVIDERS } from '../water.constants';
import { WaterMeasurementCacheService } from './water-measurement-cache.service';
import { WaterProfileEntity } from '../domain/entities/water-profile.entity';
import { WaterProviderKey } from '../domain/enums/water-provider-key.enum';
import {
  WaterQualityProviderPort,
  WaterSample,
} from '../domain/ports/water-quality-provider.port';
import { WaterAggregationDomainService } from '../domain/services/water-aggregation-domain.service';

interface CacheEntry {
  readonly value: WaterProfileEntity;
  readonly expiresAt: number;
}

export interface GetWaterProfileInput {
  readonly codeInsee: string;
  readonly year: number;
  readonly provider?: WaterProviderKey;
}

@Injectable()
export class WaterService {
  private static readonly MAX_CACHE_ENTRIES = 500;

  private readonly domainService = new WaterAggregationDomainService();
  private readonly cache = new Map<string, CacheEntry>();

  constructor(
    @Inject(WATER_PROVIDERS)
    private readonly providers: WaterQualityProviderPort[],
    @Inject(WATER_CONFIG)
    private readonly waterConfig: WaterConfig,
    private readonly cacheService: WaterMeasurementCacheService,
  ) {}

  async getWaterProfile(
    input: GetWaterProfileInput,
  ): Promise<WaterProfileEntity> {
    const providerKey = input.provider ?? this.waterConfig.defaultProvider;
    this.pruneExpiredEntries();

    const cacheKey = this.buildCacheKey(
      input.codeInsee,
      input.year,
      providerKey,
    );
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    const provider = this.selectProvider(providerKey);
    // Network resolution stays live (communes_udi) as in slice 1 (ADR-0025 §
    // Storage). A full Hub'Eau outage here has no cached fallback — the
    // commune→network cache is a deferred enhancement.
    const network = await provider.findDominantNetworkByInsee(input.codeInsee);
    if (!network) {
      throw new NotFoundException('No water network found for this INSEE code');
    }

    // Slice-2: refresh our append-only cache only when Hub'Eau is genuinely
    // newer, then serve from the DB. A Hub'Eau failure is captured (not thrown)
    // so we can still fall back to cached data below.
    const syncError = await this.syncNetworkIfStale(
      provider,
      network.code,
      input.year,
    );

    const samples = await this.cacheService.readSamples({
      networkCode: network.code,
      year: input.year,
      limit: this.waterConfig.hubeauResultatsDisSize,
    });

    if (!samples.length) {
      // Nothing cached to fall back on: if that is because Hub'Eau failed,
      // surface the outage (502) rather than masking it as "no data" (404).
      if (syncError) {
        throw syncError;
      }
      throw new NotFoundException(
        'No sample available for this network and year',
      );
    }

    const profile = this.domainService.aggregate({
      provider: providerKey,
      codeInsee: input.codeInsee,
      year: input.year,
      networkName: network.name,
      samples,
      maxSamples: this.waterConfig.hubeauMaxSamples,
    });

    this.setCached(cacheKey, profile);
    return profile;
  }

  /**
   * Conditional sync (ADR-0025, slice 2): a cheap size=1 date-check gates the
   * expensive full fetch, so most lookups do no heavy Hub'Eau call. A Hub'Eau
   * failure during the check or fetch is returned (not thrown) so the caller
   * can fall back to the last known DB data; the caller re-surfaces it only when
   * nothing is cached. A genuine no-data window and an up-to-date cache both
   * skip the fetch and return null (no error).
   *
   * Two concurrent requests for a stale network can both fetch-and-append before
   * either closes the gate; this is safe (the append is idempotent on the unique
   * key), only mildly wasteful. Per-key in-flight coalescing is a deferred
   * optimisation.
   *
   * @returns the swallowed Hub'Eau error, or null when the sync succeeded/was a no-op.
   */
  private async syncNetworkIfStale(
    provider: WaterQualityProviderPort,
    networkCode: string,
    year: number,
  ): Promise<Error | null> {
    let hubeauLatest: string | null;
    try {
      hubeauLatest = await provider.getNetworkLatestSampleDate({
        networkCode,
        year,
      });
    } catch (error) {
      // Hub'Eau unreachable during the date-check → serve last known (DB).
      return toError(error);
    }

    if (hubeauLatest === null) {
      // Hub'Eau holds nothing for this window → nothing to sync.
      return null;
    }

    const storedLatest = await this.cacheService.getStoredMaxDate({
      networkCode,
      year,
    });
    if (storedLatest !== null && storedLatest >= hubeauLatest) {
      // Our cache is already current → no full fetch.
      return null;
    }

    let samples: WaterSample[];
    try {
      samples = await provider.getNetworkSamples({
        networkCode,
        year,
        size: this.waterConfig.hubeauResultatsDisSize,
      });
    } catch (error) {
      // Full fetch failed → serve last known (DB).
      return toError(error);
    }

    await this.cacheService.appendMeasurements(networkCode, samples);
    return null;
  }

  private selectProvider(
    providerKey: WaterProviderKey,
  ): WaterQualityProviderPort {
    const provider = this.providers.find(
      (candidate) => candidate.key === providerKey,
    );
    if (!provider) {
      throw new BadGatewayException(
        `Unsupported water provider: ${providerKey}`,
      );
    }

    return provider;
  }

  private buildCacheKey(
    codeInsee: string,
    year: number,
    provider: WaterProviderKey,
  ): string {
    return `${provider}:${codeInsee}:${year}`;
  }

  private getCached(cacheKey: string): WaterProfileEntity | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now >= cached.expiresAt) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.value;
  }

  private setCached(cacheKey: string, value: WaterProfileEntity): void {
    this.pruneExpiredEntries();

    if (this.cache.size >= WaterService.MAX_CACHE_ENTRIES) {
      const oldestKey = this.cache.keys().next().value as string | undefined;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const ttlSeconds = this.waterConfig.hubeauCacheTtlSeconds;
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(cacheKey, { value, expiresAt });
  }

  private pruneExpiredEntries(now = Date.now()): void {
    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

/** Normalise a caught value to an Error (the provider always throws a Nest HttpException). */
function toError(error: unknown): Error {
  return error instanceof Error
    ? error
    : new BadGatewayException("Hub'Eau request failed");
}
