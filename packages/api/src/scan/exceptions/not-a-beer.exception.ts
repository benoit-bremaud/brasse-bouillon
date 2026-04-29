import { UnprocessableEntityException } from '@nestjs/common';

/**
 * Not-A-Beer Exception (Issue #798 — scan jury edge case D).
 *
 * Thrown when OpenFoodFacts resolves the barcode to an existing
 * product but the product's `categories_tags` do not include any
 * beer category (`en:beers`, `en:beer*`). Rather than refusing
 * with a generic 404, we surface the product name so the mobile
 * client can render a helpful "Vous avez scanné <productName> —
 * ce n'est pas une bière" screen instead of treating it as a
 * normal not-found error.
 *
 * HTTP Status: 422 Unprocessable Entity
 * Response body:
 * {
 *   "statusCode": 422,
 *   "message": {
 *     "errorCode": "NOT_A_BEER",
 *     "barcode": "5449000000996",
 *     "productName": "Coca-Cola Original"
 *   },
 *   "error": "Unprocessable Entity"
 * }
 *
 * The mobile data layer keys off `errorCode === 'NOT_A_BEER'` to
 * dispatch to its dedicated UI variant.
 */
export class NotABeerException extends UnprocessableEntityException {
  constructor(barcode: string, productName: string | null) {
    super({
      errorCode: 'NOT_A_BEER',
      barcode,
      productName,
    });
  }
}
