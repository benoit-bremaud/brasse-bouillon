// Compliance constants for the Labels feature.
//
// Lives in the `domain/` layer (not in `application/labels.use-cases.ts`)
// so that presentation code can import it directly without coupling to
// a use-cases module that is routinely mocked in tests. Mocking the
// use-cases module would otherwise turn this constant into `undefined`
// at test time and silently break compliance assertions. See #634 review.
//
// Loi Évin (article L.3323-4 du Code de la santé publique) requires
// every alcoholic-beverage label to carry the mention below.
export const DEFAULT_LABEL_LEGAL_HINT =
  "L’abus d’alcool est dangereux pour la santé, à consommer avec modération.";
