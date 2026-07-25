import { orderReducer, placeOrder, lastOrder, Order, OrderState } from "./order.slice";
import { createTransactionCode } from "../lib/createTransactionCode";
import { IProduct } from "@/entities/product";

const product = (id: number, price: number, quantity: number): IProduct => ({
  id,
  src: `/images/products/${id}.png`,
  name: `Product ${id}`,
  unitValue: 1,
  unit: "kg",
  price,
  category: "Vegetables",
  category_id: 1,
  quantity,
});

const order: Order = {
  transactionCode: "ABCDEFGHJK",
  placedAt: "24 July, 10:00 AM",
  paymentMethod: "Mastercard •• 8802",
  items: [product(1, 2.5, 2), product(2, 1.0, 1)],
  subtotal: "6.00",
  serviceFee: "1.50",
  total: "7.50",
};

describe("orderSlice reducer", () => {
  // Nothing has been bought yet
  it("starts without an order", () => {
    const state = orderReducer(undefined, { type: "unknown" });
    expect(state.lastOrder).toBeNull();
  });

  // The placed order is what the receipt reads from
  it("stores the placed order", () => {
    const state = orderReducer(undefined, placeOrder(order));
    expect(state.lastOrder).toEqual(order);
  });

  // A second purchase replaces the first
  it("replaces a previous order", () => {
    const first = orderReducer(undefined, placeOrder(order));
    const second = orderReducer(first, placeOrder({ ...order, transactionCode: "ZZZZZZZZZZ" }));

    expect(second.lastOrder?.transactionCode).toBe("ZZZZZZZZZZ");
  });

  // The receipt lines have to agree with each other
  it("keeps subtotal, fee and total consistent", () => {
    const state = orderReducer(undefined, placeOrder(order));
    const placed = state.lastOrder as Order;

    expect(Number(placed.subtotal) + Number(placed.serviceFee)).toBeCloseTo(Number(placed.total));
  });
});

describe("orderSlice selectors", () => {
  it("lastOrder returns the stored order", () => {
    const state: { order: OrderState } = { order: { lastOrder: order } };
    expect(lastOrder(state)).toEqual(order);
  });

  it("lastOrder returns null when nothing was bought", () => {
    const state: { order: OrderState } = { order: { lastOrder: null } };
    expect(lastOrder(state)).toBeNull();
  });
});

describe("createTransactionCode", () => {
  it("produces a fixed-length code of unambiguous characters", () => {
    for (let i = 0; i < 50; i += 1) {
      expect(createTransactionCode()).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/);
    }
  });

  it("does not hand out the same code twice in a row", () => {
    const codes = new Set(Array.from({ length: 20 }, () => createTransactionCode()));
    expect(codes.size).toBeGreaterThan(1);
  });
});
