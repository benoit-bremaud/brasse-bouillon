import { CapacityFitInput, computeCapacityFit } from './capacity-fit';
import {
  FermenterReason,
  FermenterVerdict,
  KettleReason,
  KettleVerdict,
} from './enums/capacity-verdict.enum';

const HS = 0.1;

function input(overrides: Partial<CapacityFitInput> = {}): CapacityFitInput {
  return {
    batchSizeL: 4.3,
    recipeWater: { mashVolumeL: 3, spargeVolumeL: 2 },
    profile: { fermenterVolumeL: 5, boilKettleVolumeL: 10 },
    headspaceRatio: HS,
    ...overrides,
  };
}

describe('computeCapacityFit', () => {
  describe('no equipment profile', () => {
    it('returns both legs NOT_EVALUATED with NO_PROFILE and no numbers', () => {
      const fit = computeCapacityFit(input({ profile: null }));

      expect(fit.fermenter).toBe(FermenterVerdict.NOT_EVALUATED);
      expect(fit.fermenterReason).toBe(FermenterReason.NO_PROFILE);
      expect(fit.kettle).toBe(KettleVerdict.NOT_EVALUATED);
      expect(fit.kettleReason).toBe(KettleReason.NO_PROFILE);
      expect(fit.fermenterUsableL).toBeNull();
      expect(fit.recipeVolumeL).toBeNull();
      expect(fit.preBoilL).toBeNull();
      expect(fit.kettleCapacityL).toBeNull();
      expect(fit.scaleRatio).toBeNull();
    });
  });

  describe('fermenter leg', () => {
    it('FITS the canonical guided first brew (4.3 L in a 5 L demijohn, headspace 0.10)', () => {
      const fit = computeCapacityFit(input({ batchSizeL: 4.3 }));

      expect(fit.fermenter).toBe(FermenterVerdict.FITS);
      expect(fit.fermenterReason).toBeNull();
      expect(fit.fermenterUsableL).toBe(4.5);
      expect(fit.recipeVolumeL).toBe(4.3);
      expect(fit.scaleRatio).toBeNull();
    });

    it('treats a recipe exactly at usable volume as FITS (strict >)', () => {
      const fit = computeCapacityFit(input({ batchSizeL: 4.5 }));
      expect(fit.fermenter).toBe(FermenterVerdict.FITS);
      expect(fit.scaleRatio).toBeNull();
    });

    it('flags TOO_LARGE with a finite scale ratio (20 L in a 5 L fermenter)', () => {
      const fit = computeCapacityFit(input({ batchSizeL: 20 }));

      expect(fit.fermenter).toBe(FermenterVerdict.TOO_LARGE);
      expect(fit.fermenterUsableL).toBe(4.5);
      expect(fit.scaleRatio).toBe(4.44); // 20 / 4.5
      expect(Number.isFinite(fit.scaleRatio as number)).toBe(true);
    });

    it.each([null, 0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
      'NOT_EVALUATED (NO_RECIPE_VOLUME) for a degenerate batch_size_l: %p',
      (batchSizeL) => {
        const fit = computeCapacityFit(input({ batchSizeL }));
        expect(fit.fermenter).toBe(FermenterVerdict.NOT_EVALUATED);
        expect(fit.fermenterReason).toBe(FermenterReason.NO_RECIPE_VOLUME);
        expect(fit.fermenterUsableL).toBeNull();
        expect(fit.recipeVolumeL).toBeNull();
        expect(fit.scaleRatio).toBeNull();
      },
    );

    it.each([0, -5, Number.NaN])(
      'NOT_EVALUATED (NO_FERMENTER_VOLUME) for a degenerate fermenter capacity: %p',
      (fermenterVolumeL) => {
        const fit = computeCapacityFit(
          input({ profile: { fermenterVolumeL, boilKettleVolumeL: 10 } }),
        );
        expect(fit.fermenter).toBe(FermenterVerdict.NOT_EVALUATED);
        expect(fit.fermenterReason).toBe(FermenterReason.NO_FERMENTER_VOLUME);
        expect(fit.fermenterUsableL).toBeNull();
      },
    );

    it.each([1, 1.5, Number.NaN])(
      'NOT_EVALUATED (no fabricated NaN/Infinity) for a headspaceRatio that yields a non-positive usable volume: %p',
      (headspaceRatio) => {
        const fit = computeCapacityFit(input({ headspaceRatio }));
        expect(fit.fermenter).toBe(FermenterVerdict.NOT_EVALUATED);
        expect(fit.fermenterReason).toBe(FermenterReason.NO_FERMENTER_VOLUME);
        expect(fit.fermenterUsableL).toBeNull();
        expect(fit.scaleRatio).toBeNull();
      },
    );
  });

  describe('kettle leg', () => {
    it('OK when the pre-boil fits the kettle', () => {
      const fit = computeCapacityFit(
        input({ recipeWater: { mashVolumeL: 3, spargeVolumeL: 2 } }),
      );
      expect(fit.kettle).toBe(KettleVerdict.OK);
      expect(fit.kettleReason).toBeNull();
      expect(fit.preBoilL).toBe(5);
      expect(fit.kettleCapacityL).toBe(10);
    });

    it('WARNING (never HARD_STOP in v1) when the pre-boil exceeds the kettle', () => {
      const fit = computeCapacityFit(
        input({ recipeWater: { mashVolumeL: 8, spargeVolumeL: 6 } }),
      );
      expect(fit.kettle).toBe(KettleVerdict.WARNING);
      expect(fit.preBoilL).toBe(14);
    });

    it('NOT_EVALUATED (NO_RECIPE_WATER) when there is no water row', () => {
      const fit = computeCapacityFit(input({ recipeWater: null }));
      expect(fit.kettle).toBe(KettleVerdict.NOT_EVALUATED);
      expect(fit.kettleReason).toBe(KettleReason.NO_RECIPE_WATER);
      expect(fit.preBoilL).toBeNull();
      expect(fit.kettleCapacityL).toBeNull();
    });

    it('NOT_EVALUATED (NO_RECIPE_WATER) when the water row is empty (0 + 0)', () => {
      const fit = computeCapacityFit(
        input({ recipeWater: { mashVolumeL: 0, spargeVolumeL: 0 } }),
      );
      expect(fit.kettle).toBe(KettleVerdict.NOT_EVALUATED);
      expect(fit.kettleReason).toBe(KettleReason.NO_RECIPE_WATER);
    });

    it('NOT_EVALUATED (NO_KETTLE_VOLUME) for a degenerate kettle capacity', () => {
      const fit = computeCapacityFit(
        input({ profile: { fermenterVolumeL: 5, boilKettleVolumeL: 0 } }),
      );
      expect(fit.kettle).toBe(KettleVerdict.NOT_EVALUATED);
      expect(fit.kettleReason).toBe(KettleReason.NO_KETTLE_VOLUME);
      expect(fit.preBoilL).toBeNull();
    });
  });

  describe('legs are independent', () => {
    it('a valid profile with a volume-less, water-less recipe → per-leg NOT_EVALUATED (distinct from NO_PROFILE)', () => {
      const fit = computeCapacityFit(
        input({ batchSizeL: null, recipeWater: null }),
      );
      expect(fit.fermenterReason).toBe(FermenterReason.NO_RECIPE_VOLUME);
      expect(fit.kettleReason).toBe(KettleReason.NO_RECIPE_WATER);
      // Not the no-profile reason — the client must render recipe-side messages.
      expect(fit.fermenterReason).not.toBe(FermenterReason.NO_PROFILE);
    });

    it('never emits HARD_STOP in v1 across a large input sweep', () => {
      for (const preBoil of [1, 5, 14, 50]) {
        const fit = computeCapacityFit(
          input({
            recipeWater: { mashVolumeL: preBoil, spargeVolumeL: 0 },
            profile: { fermenterVolumeL: 5, boilKettleVolumeL: 10 },
          }),
        );
        expect(fit.kettle).not.toBe(KettleVerdict.HARD_STOP);
      }
    });
  });
});
