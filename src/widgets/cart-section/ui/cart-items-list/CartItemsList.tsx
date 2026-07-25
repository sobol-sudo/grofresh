import { useAppSelector } from "@/app/providers/store-provider/config/hooks";
import { selectedCartCount } from "@/entities/cart/model/cart.slice";
import { IProduct, ProductCart } from "@/entities/product";
import Image from "next/image";
import { useState } from "react";

interface CartItemsListProps {
  items: IProduct[];
  showDefaultItems: number
}

export default function CartItemsList({ items, showDefaultItems }: CartItemsListProps) {
  const [isAll, isAllSet] = useState(false)

  const cartUniqueItemsCount = useAppSelector(selectedCartCount);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-10 select-none">
        <Image
          src="/images/cart/empty-cart.png"
          alt="Empty cart"
          width={150}
          height={150}
        />
        <p className="mt-4 text-gray-500 text-center">
          Your cart is empty
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-[22px] flex flex-col gap-2.5">
        {items
          .slice(0, isAll ? items.length : showDefaultItems)
          .map((item) => (
            <ProductCart key={item.id} product={item} />
          ))}
      </div>

      {
        cartUniqueItemsCount > showDefaultItems && (
          <div
            className="mt-[22px] flex items-center gap-[18px] cursor-pointer select-none"
            onClick={() => isAllSet((prev) => !prev)}
          >
            <div className="border w-full"></div>
            <span className="small-regular shrink-0">
              {isAll
                ? "Less items"
                : `Show ${Math.max(0, items.length - showDefaultItems)} more`}
            </span>
            <div className="border w-full"></div>
          </div>
        )
      }
    </>

  )
}