import {
  type ScanProductDetails,
  type ScanProductRecord,
  type ScanProductRepository,
} from "@/features/scan/domain/scan.types";

const MOCK_SCAN_PRODUCTS: ScanProductRecord[] = [
  {
    id: "beer-1",
    name: "Session IPA Citra",
    brewery: "Brasse Bouillon Labs",
    style: "Session IPA",
    format: "Can 44cl",
    abv: 5.1,
    ibu: 42,
    colorEbc: 11,
    thumbnailUri: "https://example.com/images/session-ipa-citra.jpg",
    barcodeValues: ["3760241234501", "3760241234502"],
    labelKeywords: ["session ipa", "citra", "brasse bouillon labs"],
  },
  {
    id: "beer-2",
    name: "Amber Ale Maison",
    brewery: "Brasse Bouillon Atelier",
    style: "Amber Ale",
    format: "Bottle 33cl",
    abv: 5.6,
    ibu: 29,
    colorEbc: 26,
    thumbnailUri: "https://example.com/images/amber-ale-maison.jpg",
    barcodeValues: ["3760241234600"],
    labelKeywords: ["amber ale", "maison", "atelier"],
  },
  {
    id: "beer-3",
    name: "Imperial Stout Noire",
    brewery: "Brasse Bouillon Barrel",
    style: "Imperial Stout",
    format: "Bottle 75cl",
    abv: 9.2,
    ibu: 65,
    colorEbc: 150,
    thumbnailUri: "https://example.com/images/imperial-stout-noire.jpg",
    barcodeValues: ["3760241234709"],
    labelKeywords: ["imperial stout", "noire", "barrel"],
  },
];

const MOCK_SCAN_PRODUCT_DETAILS: ScanProductDetails[] = [
  {
    productId: "beer-1",
    description:
      "Session IPA brewed with Citra and Mosaic for a dry, citrus-forward finish.",
    ingredients: ["Water", "Barley malt", "Citra hops", "Mosaic hops", "Yeast"],
    tastingNotes: ["Citrus", "Tropical fruit", "Dry finish"],
    servingTemperatureCelsius: "6-8°C",
    foodPairings: ["Fish tacos", "Aged cheddar", "Spicy ramen"],
  },
  {
    productId: "beer-2",
    description:
      "Amber ale with caramel malt complexity and a subtle toasty backbone.",
    ingredients: [
      "Water",
      "Barley malt",
      "Caramunich",
      "Magnum hops",
      "Ale yeast",
    ],
    tastingNotes: ["Caramel", "Toffee", "Toasted bread"],
    servingTemperatureCelsius: "8-10°C",
    foodPairings: ["Burger", "Roasted chicken", "Matured gouda"],
  },
  {
    productId: "beer-3",
    description:
      "A robust imperial stout with intense roast, chocolate and coffee aromas.",
    ingredients: [
      "Water",
      "Barley malt",
      "Roasted barley",
      "Chocolate malt",
      "Yeast",
    ],
    tastingNotes: ["Dark chocolate", "Espresso", "Roasted malt"],
    servingTemperatureCelsius: "10-12°C",
    foodPairings: ["Chocolate fondant", "Blue cheese", "Smoked brisket"],
  },
];

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function findProductDetailsById(productId: string): ScanProductDetails | null {
  return (
    MOCK_SCAN_PRODUCT_DETAILS.find(
      (details) => details.productId === productId,
    ) ?? null
  );
}

export const scanMockRepository: ScanProductRepository = {
  async findByLabel(labelHint: string): Promise<ScanProductRecord | null> {
    const normalizedLabel = normalize(labelHint);
    if (!normalizedLabel) {
      return null;
    }

    return (
      MOCK_SCAN_PRODUCTS.find((product) =>
        product.labelKeywords.some((keyword) =>
          normalizedLabel.includes(normalize(keyword)),
        ),
      ) ?? null
    );
  },

  async findByBarcode(barcodeValue: string): Promise<ScanProductRecord | null> {
    const normalizedBarcode = normalize(barcodeValue);
    if (!normalizedBarcode) {
      return null;
    }

    return (
      MOCK_SCAN_PRODUCTS.find((product) =>
        product.barcodeValues.some(
          (candidateBarcode) =>
            normalize(candidateBarcode) === normalizedBarcode,
        ),
      ) ?? null
    );
  },

  async getProductDetails(
    productId: string,
  ): Promise<ScanProductDetails | null> {
    if (!productId.trim()) {
      return null;
    }

    return findProductDetailsById(productId);
  },
};
