import {
  BadGatewayException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { WaterConfig } from '../../config/water.config';
import { WATER_CONFIG, WATER_PROVIDERS } from '../water.constants';
import { WaterProfileEntity } from '../domain/entities/water-profile.entity';
import { WaterProviderKey } from '../domain/enums/water-provider-key.enum';
import { WaterQualityProviderPort } from '../domain/ports/water-quality-provider.port';
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
    const network = await provider.findDominantNetworkByInsee(input.codeInsee);
    if (!network) {
      throw new NotFoundException('No water network found for this INSEE code');
    }

    const samples = await provider.getNetworkSamples({
      networkCode: network.code,
      year: input.year,
      size: this.waterConfig.hubeauResultatsDisSize,
    });

    if (!samples.length) {
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
