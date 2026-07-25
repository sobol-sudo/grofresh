import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IProduct, discountedPrice } from '@/entities/product'

export interface ProductState {
  items: IProduct[],
  selectedProduct: IProduct | null
}
const initialState: ProductState = {
  items: [],
  selectedProduct: null,
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCartItem(state, action: PayloadAction<IProduct>) {
      const existingItemInCart = state.items.find(el => el.id === action.payload.id)

      if (state.selectedProduct?.id === action.payload.id) {
        state.items = state.items.reduce((acc, item) => {

          if (item.id !== action.payload.id) {
            acc.push(item);
          }

          return acc;
        }, [] as IProduct[]);
        state.selectedProduct = null
        return
      }

      const item = { ...action.payload, quantity: existingItemInCart?.quantity ? existingItemInCart.quantity : 1 }
      if (!existingItemInCart) {
        state.items.push(item)
        state.selectedProduct = item
      } else {
        state.items = state.items.reduce((acc, item) => {

          if (item.id !== action.payload.id) {
            acc.push(item);
          }

          return acc;
        }, [] as IProduct[]);
        state.selectedProduct = { ...action.payload, quantity: 0 }
      }
    },
    incrementItem(state, action: PayloadAction<IProduct>) {
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);

      if (existingItemIndex === -1) {
        state.items.push({ ...action.payload, quantity: 1 });
      } else {
        state.items[existingItemIndex].quantity += 1;
      }
    },
    toggleSelectedProduct(state, action: PayloadAction<IProduct>) {
      if (state.selectedProduct?.id === action.payload.id) {
        state.selectedProduct = null
      } else {
        state.selectedProduct = action.payload
      }
    },

    decrementOrRemoveItem(state, action: PayloadAction<IProduct>) {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index === -1) return;

      if (state.items[index].quantity > 1) {
        state.items[index].quantity -= 1;
      } else {
        state.items.splice(index, 1);
      }

      state.selectedProduct = state.items.find(el => el.id === action.payload.id) || null;
    },
    clearLastProduct(state) {
      state.selectedProduct = null
    },
    clearCart(state) {
      state.items = []
      state.selectedProduct = null
    }
  },
})

export const { toggleCartItem, decrementOrRemoveItem, clearLastProduct, incrementItem, toggleSelectedProduct, clearCart } = cartSlice.actions
export const cartReducer = cartSlice.reducer

export const selectedCartQuantity = (state: { cart: ProductState }) => state.cart.items.reduce((acc, cur) => acc += cur.quantity, 0)
export const selectedProduct = (state: { cart: ProductState }) => state.cart.selectedProduct
export const selectedCartItems = (state: { cart: ProductState }) => state.cart.items
export const selectedCartCount = (state: { cart: ProductState }) => state.cart.items.length
export const isInCart = (state: { cart: ProductState }, product: IProduct): boolean => state.cart.items.some(el => el.id === product.id)
/**
 * What the cart costs, before the service fee.
 *
 * This goes through `discountedPrice` for the same reason the product card does: the
 * catalog advertises a promotion, and a total built from list prices would quietly
 * charge for a discount the customer was shown.
 */
export const allPriceCart = (state: { cart: ProductState }) => state.cart.items.reduce((acc, el) => acc += discountedPrice(el) * el.quantity, 0).toFixed(2)