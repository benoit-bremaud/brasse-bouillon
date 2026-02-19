import {
  BadGatewayException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { EauConfig } from '../../config/eau.config';
import { EAU_CONFIG, WATER_PROVIDERS } from '../eau.constants';
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
  readonly annee: number;
  readonly provider?: WaterProviderKey;
}

@Injectable()
export class EauService {
  private readonly domainService = new WaterAggregationDomainService();
  private readonly cache = new Map<string, CacheEntry>();

  constructor(
    @Inject(WATER_PROVIDERS)
    private readonly providers: WaterQualityProviderPort[],
    @Inject(EAU_CONFIG)
    private readonly eauConfig: EauConfig,
    private readonly configService: ConfigService,
  ) {}

  async getWaterProfile(
    input: GetWaterProfileInput,
  ): Promise<WaterProfileEntity> {
    const providerKey = input.provider ?? this.eauConfig.defaultProvider;
    const cacheKey = this.buildCacheKey(
      input.codeInsee,
      input.annee,
      providerKey,
    );
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    const provider = this.selectProvider(providerKey);
    const network = await provider.findDominantNetworkByInsee(input.codeInsee);
    if (!network) {
      throw new NotFoundException(
        'Aucun réseau d’eau trouvé pour ce code INSEE',
      );
    }

    const samples = await provider.getNetworkSamples({
      networkCode: network.code,
      year: input.annee,
      size: this.eauConfig.hubeauResultatsDisSize,
    });

    if (!samples.length) {
      throw new NotFoundException(
        'Aucun prélèvement disponible pour ce réseau et cette année',
      );
    }

    const profile = this.domainService.aggregate({
      provider: providerKey,
      codeInsee: input.codeInsee,
      annee: input.annee,
      networkName: network.name,
      samples,
      maxSamples: this.eauConfig.hubeauMaxSamples,
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
        `Provider eau non supporté: ${providerKey}`,
      );
    }

    return provider;
  }

  private buildCacheKey(
    codeInsee: string,
    annee: number,
    provider: WaterProviderKey,
  ): string {
    return `${provider}:${codeInsee}:${annee}`;
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
    const ttlSeconds = this.resolveCacheTtlSeconds();
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(cacheKey, { value, expiresAt });
  }

  private resolveCacheTtlSeconds(): number {
    const raw = this.configService.get<string>('HUBEAU_CACHE_TTL_SECONDS');
    if (!raw) {
      return this.eauConfig.hubeauCacheTtlSeconds;
    }

    const parsed = Number.parseInt(raw, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return this.eauConfig.hubeauCacheTtlSeconds;
    }

    return parsed;
  }
}
