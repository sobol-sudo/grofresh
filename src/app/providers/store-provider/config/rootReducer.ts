import { cartReducer } from '@/entities/cart/model/cart.slice'
import { productReducer } from '@/entities/product/model/product.slice'
import { paymentReducer } from '@/entities/payment/model/payment.slice'
import { orderReducer } from '@/entities/order'
import { notificationReducer } from '@/entities/notification'
import { combineReducers } from '@reduxjs/toolkit'

export const rootReducer = combineReducers({
  product: productReducer,
  cart: cartReducer,
  payment: paymentReducer,
  order: orderReducer,
  notification: notificationReducer
})

// Derived from the reducer rather than from the store, so middleware can be typed
// against the state without the store's type depending on its own middleware.
export type RootState = ReturnType<typeof rootReducer>
