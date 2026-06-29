import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';

import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { useContainer } from 'class-validator';

import { EQUIPMENT_SYSTEM_DEFAULTS } from '../src/equipment/domain/equipment-system-defaults';
import { EquipmentSystemType } from '../src/equipment/domain/enums/equipment-system-type.enum';

/**
 * E1 — equipment wizard create endpoint, e2e.
 *
 * The 3-question wizard sends only name + system type + fermenter & boil-kettle
 * volumes. The backend must accept that minimal body (201) and seed the hidden
 * brewing constants (efficiency, boil-off rate, mash-tun volume) from the
 * per-system-type defaults. An out-of-range efficiency must still be a 400.
 */
const TEST_PASSWORD = 'SecurePassword123!'; // NOSONAR

interface RegisterResult {
  token: string;
}

describe('Equipment profile create (e2e — E1)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Override the rate limiter so registration is not throttled — this suite
      // tests the create contract, not rate limiting.
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  async function register(): Promise<RegisterResult> {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-9);
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `equipment-e2e-${suffix}@example.com`,
        username: `equip_${suffix}`,
        password: TEST_PASSWORD,
        first_name: 'Equip',
        last_name: 'E2E',
      })
      .expect(201);

    const body = response.body as { access_token?: unknown };
    if (typeof body.access_token !== 'string') {
      throw new TypeError(
        'Expected register response to carry an access_token',
      );
    }
    return { token: body.access_token };
  }

  // Happy — a minimal wizard body is accepted and the hidden constants are
  // seeded from the all-grain defaults; mash tun mirrors the boil kettle.
  it('creates a profile from the minimal wizard body and seeds defaults', async () => {
    const { token } = await register();

    const response = await request(app.getHttpServer())
      .post('/equipment-profiles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Tout-grain 30 L',
        fermenter_volume_l: 23,
        boil_kettle_volume_l: 30,
        system_type: EquipmentSystemType.ALL_GRAIN,
      })
      .expect(201);

    const defaults = EQUIPMENT_SYSTEM_DEFAULTS[EquipmentSystemType.ALL_GRAIN];
    const body = response.body as {
      id: string;
      mash_tun_volume_l: number;
      boil_kettle_volume_l: number;
      fermenter_volume_l: number;
      evaporation_rate_l_per_hour: number;
      efficiency_estimated_percent: number;
      system_type: string;
    };

    expect(typeof body.id).toBe('string');
    expect(body.boil_kettle_volume_l).toBe(30);
    expect(body.fermenter_volume_l).toBe(23);
    expect(body.mash_tun_volume_l).toBe(30);
    expect(body.evaporation_rate_l_per_hour).toBe(
      defaults.evaporationRateLPerHour,
    );
    expect(body.efficiency_estimated_percent).toBe(
      defaults.efficiencyEstimatedPercent,
    );
    expect(body.system_type).toBe(EquipmentSystemType.ALL_GRAIN);
  });

  // Sad — an out-of-range efficiency is rejected by the ValidationPipe (400).
  it('rejects an out-of-range efficiency with 400', async () => {
    const { token } = await register();

    await request(app.getHttpServer())
      .post('/equipment-profiles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Invalid',
        fermenter_volume_l: 23,
        boil_kettle_volume_l: 30,
        efficiency_estimated_percent: 101,
        system_type: EquipmentSystemType.ALL_GRAIN,
      })
      .expect(400);
  });
});
