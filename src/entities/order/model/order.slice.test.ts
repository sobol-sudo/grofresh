import {
  orderReducer,
  placeOrder,
  hydrateOrders,
  lastOrder,
  selectOrders,
  selectOrderCount,
  selectOrdersHydrated,
  selectOrderByCode,
  MAX_STORED_ORDERS,
  Order,
  OrderState,
} from "./order.slice";
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
    const state: { order: OrderState } = {
      order: { orders: [order], lastOrder: order, isHydrated: true },
    };
    expect(lastOrder(state)).toEqual(order);
  });

  it("lastOrder returns null when nothing was bought", () => {
    const state: { order: OrderState } = {
      order: { orders: [], lastOrder: null, isHydrated: true },
    };
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

describe("orderSlice history", () => {
  // The receipt is one order; the history screen needs all of them
  it("keeps every placed order, newest first", () => {
    const first = orderReducer(undefined, placeOrder(order));
    const second = orderReducer(first, placeOrder({ ...order, transactionCode: "SECOND1234" }));

    expect(second.orders).toHaveLength(2);
    expect(second.orders[0].transactionCode).toBe("SECOND1234");
    expect(second.orders[1].transactionCode).toBe("ABCDEFGHJK");
  });

  // The receipt still shows the order that was just paid for, not the whole history
  it("points lastOrder at the newest order", () => {
    const first = orderReducer(undefined, placeOrder(order));
    const second = orderReducer(first, placeOrder({ ...order, transactionCode: "SECOND1234" }));

    expect(second.lastOrder?.transactionCode).toBe("SECOND1234");
  });

  // Storage is not an archive
  it("caps the history at MAX_STORED_ORDERS", () => {
    const state = Array.from({ length: MAX_STORED_ORDERS + 5 }).reduce<OrderState>(
      (acc, _, index) =>
        orderReducer(acc, placeOrder({ ...order, transactionCode: `CODE${index}` })),
      undefined as unknown as OrderState
    );

    expect(state.orders).toHaveLength(MAX_STORED_ORDERS);
    expect(state.orders[0].transactionCode).toBe(`CODE${MAX_STORED_ORDERS + 4}`);
  });
});

describe("orderSlice hydration", () => {
  // Nothing is known about past purchases until storage has been read
  it("starts un-hydrated with an empty history", () => {
    const state = orderReducer(undefined, { type: "unknown" });

    expect(state.orders).toEqual([]);
    expect(state.isHydrated).toBe(false);
  });

  it("restores stored orders and flips the hydrated flag", () => {
    const state = orderReducer(undefined, hydrateOrders([order]));

    expect(state.orders).toEqual([order]);
    expect(state.isHydrated).toBe(true);
  });

  // An empty read is still a read: the history screen must stop waiting
  it("flips the hydrated flag even when nothing was stored", () => {
    const state = orderReducer(undefined, hydrateOrders([]));

    expect(state.orders).toEqual([]);
    expect(state.isHydrated).toBe(true);
  });

  // Hydration must never resurrect a receipt the user is not entitled to see
  it("leaves lastOrder null so a reload cannot replay an old receipt", () => {
    const state = orderReducer(undefined, hydrateOrders([order]));

    expect(state.lastOrder).toBeNull();
    expect(lastOrder({ order: state })).toBeNull();
  });

  // An order bought before storage was read is newer than everything in it
  it("keeps a session order on top of the restored history", () => {
    const placed = orderReducer(undefined, placeOrder({ ...order, transactionCode: "SESSION123" }));
    const state = orderReducer(placed, hydrateOrders([order]));

    expect(state.orders.map((entry) => entry.transactionCode)).toEqual([
      "SESSION123",
      "ABCDEFGHJK",
    ]);
  });

  // The session order is also the one already written to storage
  it("does not duplicate an order that is already in memory", () => {
    const placed = orderReducer(undefined, placeOrder(order));
    const state = orderReducer(placed, hydrateOrders([order]));

    expect(state.orders).toHaveLength(1);
  });
});

describe("orderSlice history selectors", () => {
  const state = (orders: Order[]): { order: OrderState } => ({
    order: { orders, lastOrder: null, isHydrated: true },
  });

  it("selectOrders returns the history", () => {
    expect(selectOrders(state([order]))).toEqual([order]);
  });

  it("selectOrderCount counts the history", () => {
    expect(selectOrderCount(state([order, { ...order, transactionCode: "SECOND1234" }]))).toBe(2);
  });

  it("selectOrdersHydrated reports whether storage has been read", () => {
    expect(selectOrdersHydrated(state([]))).toBe(true);
    expect(selectOrdersHydrated({ order: { orders: [], lastOrder: null, isHydrated: false } })).toBe(
      false
    );
  });

  it("selectOrderByCode finds an order by its transaction code", () => {
    expect(selectOrderByCode(state([order]), "ABCDEFGHJK")).toEqual(order);
  });

  // An unknown code must read as "no such order", not as the first one
  it("selectOrderByCode returns null for an unknown code", () => {
    expect(selectOrderByCode(state([order]), "NOSUCHCODE")).toBeNull();
  });
});
