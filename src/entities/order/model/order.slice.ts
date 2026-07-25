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

export interface OrderState {
  lastOrder: Order | null;
}

const initialState: OrderState = {
  lastOrder: null,
}

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    placeOrder(state, action: PayloadAction<Order>) {
      state.lastOrder = action.payload
    },
  },
})

export const { placeOrder } = orderSlice.actions
export const orderReducer = orderSlice.reducer

export const lastOrder = (state: { order: OrderState }) => state.order.lastOrder
