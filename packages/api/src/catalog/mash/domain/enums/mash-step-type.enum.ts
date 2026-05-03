/**
 * Brewing technique used at each mash step. Mirrors the BeerXML 1.0
 * `<TYPE>` element on `<MASH_STEP>` (3 values).
 *
 *   - INFUSION: pour hot water at the target temperature directly
 *     into the grain bed (most common, simplest)
 *   - TEMPERATURE: heat the existing mash up to the next target
 *     temperature using a direct heat source (HERMS / RIMS systems,
 *     stove-top brewing)
 *   - DECOCTION: remove a portion of the mash, boil it, then return
 *     it to raise the overall temperature (traditional German /
 *     Czech method, gives a distinctive malt profile)
 */
export enum MashStepType {
  INFUSION = 'infusion',
  TEMPERATURE = 'temperature',
  DECOCTION = 'decoction',
}
