import { Product, ProductCart } from "./ui";
import type { IProduct } from './model/types'


export { Product, ProductCart, IProduct }
export { hasDiscount, discountedPrice, discountSavings, formatPrice } from './lib/price'
export { selectDiscountedProducts, selectMaxDiscountPercent, selectProductCountByCategory } from './model/selectors'
