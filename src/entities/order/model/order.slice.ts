import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IProduct } from '@/entities/product'

export interface Order {
  transactionCode: string;
  placedAt: string;
  paymentMethod: string;
  items: IProduct[];
  subtotal: string;
  serviceFee: string;
  total: string;
}

/**
 * How many past orders are kept. History is a convenience, not an archive, and an
 * unbounded list would grow the stored payload for the lifetime of the browser.
 */
export const MAX_STORED_ORDERS = 20

export interface OrderState {
  /** Purchase history, newest first. Restored from storage after the client mounts. */
  orders: Order[];
  /**
   * The order placed during this session, and the only thing the receipt screen will
   * render. Deliberately never restored from storage: reloading or deep-linking
   * /checkout-success must still land on the catalog instead of replaying an old
   * receipt as if it had just been paid for.
   */
  lastOrder: Order | null;
  /**
   * False until storage has been read. Lets a history screen tell "still loading"
   * apart from "you have never ordered anything", so it never flashes an empty
   * state at someone who does have orders.
   */
  isHydrated: boolean;
}

const initialState: OrderState = {
  orders: [],
  lastOrder: null,
  isHydrated: false,
}

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    placeOrder(state, action: PayloadAction<Order>) {
      state.lastOrder = action.payload
      state.orders.unshift(action.payload)

      if (state.orders.length > MAX_STORED_ORDERS) {
        state.orders.splice(MAX_STORED_ORDERS)
      }
    },
    /**
     * Merges the persisted history in. Anything bought before storage was read is
     * newer than everything in it, so restored orders go underneath, and an order
     * already in memory is never duplicated by its stored copy.
     */
    hydrateOrders(state, action: PayloadAction<Order[]>) {
      const known = new Set(state.orders.map((order) => order.transactionCode))
      const restored = action.payload.filter((order) => !known.has(order.transactionCode))

      state.orders = [...state.orders, ...restored].slice(0, MAX_STORED_ORDERS)
      state.isHydrated = true
    },
  },
})

export const { placeOrder, hydrateOrders } = orderSlice.actions
export const orderReducer = orderSlice.reducer

export const lastOrder = (state: { order: OrderState }) => state.order.lastOrder
export const selectOrders = (state: { order: OrderState }) => state.order.orders
export const selectOrdersHydrated = (state: { order: OrderState }) => state.order.isHydrated
export const selectOrderCount = (state: { order: OrderState }) => state.order.orders.length
export const selectOrderByCode = (state: { order: OrderState }, transactionCode: string) =>
  state.order.orders.find((order) => order.transactionCode === transactionCode) ?? null
