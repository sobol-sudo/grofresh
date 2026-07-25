import { cartReducer } from '@/entities/cart/model/cart.slice'
import { productReducer } from '@/entities/product/model/product.slice'
import { paymentReducer } from '@/entities/payment/model/payment.slice'
import { orderReducer } from '@/entities/order'
import { combineReducers } from '@reduxjs/toolkit'

export const rootReducer = combineReducers({
  product: productReducer,
  cart: cartReducer,
  payment: paymentReducer,
  order: orderReducer
})
