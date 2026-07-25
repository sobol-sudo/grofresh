import Counter from "@/shared/ui/Counter";
import Image from "next/image";
import { IProduct } from "../../model/types";
import { discountedPrice, formatPrice, hasDiscount } from "../../lib/price";
import { useCartQuantity } from "@/shared/hooks/useCartQuantity/useCartQuantity";
import { useAppDispatch } from "@/app/providers/store-provider/config/hooks";
import { toggleCartItem } from "@/entities/cart/model/cart.slice";

interface ProductCartProps {
  product: IProduct
}

export default function ProductCart({ product }: ProductCartProps) {
  const { handleQuantityChange } = useCartQuantity();
  const dispatch = useAppDispatch();

  const removeProduct = () => {
    dispatch(toggleCartItem(product))
  }

  return (
    <div className="shadow flex gap-2.5 p-4 rounded-[30px]">
      <div className="bg-flash-white rounded-[20px] w-fit p-4">
        <Image
          src={product.src}
          width={100}
          height={100}
          alt="Product" />
      </div>

      <div className="flex flex-col w-full justify-between">
        <div className="flex justify-between">
          <div className="flex flex-col gap-2.5">
            <p className="h5-bold">{product.name}</p>
            <span className="medium-regular">{product.unitValue} {product.unit}</span>
          </div>

          <svg className="cursor-pointer" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-testid="delete-icon" onClick={removeProduct}>
            <path d="M18.0002 6L6.00015 18" stroke="black" strokeWidth="1.48571" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.00015 6L18.0002 18" stroke="black" strokeWidth="1.48571" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

        </div>

        <div className="flex justify-between items-center">
          <span className="flex items-baseline gap-[5px]">
            <span className="h5-bold" data-testid="cart-item-price">${formatPrice(discountedPrice(product))}</span>

            {hasDiscount(product) && (
              <s className="h6-regular text-gray-500" data-testid="cart-item-list-price">
                ${formatPrice(product.price)}
              </s>
            )}
          </span>

          <Counter quantity={product.quantity} btnSize="small" handleChange={(type) => handleQuantityChange(product, type)} />
        </div>
      </div>
    </div>
  )
}