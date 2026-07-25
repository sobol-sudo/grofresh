export interface IProduct {
  id: number;
  src: string;
  name: string;
  unitValue: number;
  unit: Unit;
  /** List price. What the product costs when no promotion is running. */
  price: number;
  category: string;
  category_id: number;
  quantity: number;
  /**
   * Active promotion, in whole percent off the list price. Absent means full price.
   * Use `discountedPrice()` rather than doing the arithmetic at each call site.
   */
  discountPercent?: number;
}

export type Unit = "g" | "kg" | "ml" | "l" | "pcs" | "dozen" | "loaf";
