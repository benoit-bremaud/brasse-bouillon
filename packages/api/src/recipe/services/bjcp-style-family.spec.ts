import {
  foldStyleKey,
  normalizeStyle,
  styleSimilarity,
} from './bjcp-style-family';

describe('bjcp-style-family (ADR-0016 D2)', () => {
  // ---------------------------------------------------------------
  // foldStyleKey
  // ---------------------------------------------------------------
  describe('foldStyleKey', () => {
    it('happy: lowercases, trims and collapses inner whitespace', () => {
      expect(foldStyleKey('  India   Pale  Ale ')).toBe('india pale ale');
    });

    it('edge: strips accents and folds apostrophes to a space', () => {
      expect(foldStyleKey("Bière Blonde à l'Ancienne")).toBe(
        'biere blonde a l ancienne',
      );
    });
  });

  // ---------------------------------------------------------------
  // normalizeStyle
  // ---------------------------------------------------------------
  describe('normalizeStyle', () => {
    it('happy: resolves a canonical style to family + tiers', () => {
      expect(normalizeStyle('Blonde Ale')).toEqual({
        canonical: 'blonde_ale',
        family: 'Pale Ale',
        colourTier: 'pale',
        strengthTier: 'standard',
      });
    });

    it('happy: resolves an FR/accented synonym to the same style', () => {
      expect(normalizeStyle("Bière Blonde à l'Ancienne")?.canonical).toBe(
        'blonde_ale',
      );
    });

    it('happy: apostrophe-less seed form resolves too ("à l Ancienne" == "à l\'Ancienne")', () => {
      // The scan-catalog seed stores "Bière Blonde à l Ancienne" (no apostrophe);
      // apostrophe folding makes it resolve to the same Blonde Ale family.
      expect(normalizeStyle('Bière Blonde à l Ancienne')?.canonical).toBe(
        'blonde_ale',
      );
    });

    it('happy: NEIPA resolves into the IPA family', () => {
      const ipa = normalizeStyle('NEIPA');
      expect(ipa?.family).toBe('IPA');
      expect(ipa?.canonical).toBe('ipa');
    });

    it('sad: an unknown / free-text label returns null', () => {
      expect(normalizeStyle('Quantum Hazy Sludge')).toBeNull();
    });

    it('edge: null / blank input returns null', () => {
      expect(normalizeStyle(null)).toBeNull();
      expect(normalizeStyle('   ')).toBeNull();
    });
  });

  // ---------------------------------------------------------------
  // styleSimilarity — graded scale {1, 0.7, 0.4, 0, null}
  // ---------------------------------------------------------------
  describe('styleSimilarity', () => {
    it('happy: same canonical style scores 1', () => {
      expect(styleSimilarity('Blonde Ale', 'blonde')).toBe(1);
    });

    it('happy: same BJCP family scores 0.7 (Blonde Ale ≈ Kölsch)', () => {
      expect(styleSimilarity('Blonde Ale', 'Kölsch')).toBe(0.7);
    });

    it('happy: same family — Blonde Ale ≈ Saison (both Pale Ale)', () => {
      expect(styleSimilarity('Blonde Ale', 'Saison')).toBe(0.7);
    });

    it('edge: different family but same colour+strength tier scores 0.4 (Blonde Ale vs NEIPA)', () => {
      // Blonde Ale = Pale Ale / pale+standard ; NEIPA = IPA / pale+standard.
      expect(styleSimilarity('Blonde Ale', 'NEIPA')).toBe(0.4);
    });

    it('sad: unrelated families and tiers score 0 (Blonde Ale vs Stout)', () => {
      // Stout = dark+standard ; Blonde Ale = pale+standard → no shared tier.
      expect(styleSimilarity('Blonde Ale', 'Stout')).toBe(0);
    });

    it('edge: an unclassifiable side drops the criterion (null)', () => {
      expect(styleSimilarity('Blonde Ale', 'Quantum Sludge')).toBeNull();
      expect(styleSimilarity(null, 'Stout')).toBeNull();
    });

    it('edge: two unclassifiable but identical labels still match (1)', () => {
      expect(styleSimilarity('Quantum Sludge', 'quantum  sludge')).toBe(1);
    });
  });
});
