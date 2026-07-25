import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/providers/store-provider/config/hooks";
import {
  selectedCartQuantity,
  selectedCartItems,
  allPriceCart as allPriceCartSelector,
  clearCart,
} from "@/entities/cart/model/cart.slice";
import {
  serviceFee as serviceFeeSelector,
  paymentMethod as paymentMethodSelector,
} from "@/entities/payment/model/payment.slice";
import { createTransactionCode, placeOrder } from "@/entities/order";
import { formatDate } from "@/shared/lib/formatDate";
import { useRouter } from "next/router";
import { BottomNavBar } from "@/features/bottom-nav-bar";
import CheckoutDetails from "./ui/checkout-details";
import CartSummary from "./ui/cart-summary";
import CartItemsList from "./ui/cart-items-list";

const showDefaultItems = 3

export default function CartSection() {
  const [isCheckoutMode, setCheckoutMode] = useState(false);

  const router = useRouter()
  const dispatch = useAppDispatch();

  const cartItems = useAppSelector(selectedCartItems);
  const cartTotalQuantity = useAppSelector(selectedCartQuantity);
  const allPriceCart = useAppSelector(allPriceCartSelector);
  const serviceFee = useAppSelector(serviceFeeSelector);
  const paymentMethod = useAppSelector(paymentMethodSelector);

  const handleProceedToCheckout = () => {
    if (!isCheckoutMode) {
      setCheckoutMode(true);
      return
    }

    if (cartItems.length === 0) return

    // Hand the cart over to the order before emptying it: the receipt then owns
    // its own copy of the numbers, and the same cart cannot be bought twice.
    dispatch(placeOrder({
      transactionCode: createTransactionCode(),
      placedAt: formatDate(),
      paymentMethod: paymentMethod ?? 'Card',
      items: cartItems,
      subtotal: Number(allPriceCart).toFixed(2),
      serviceFee: Number(serviceFee).toFixed(2),
      total: (Number(allPriceCart) + Number(serviceFee)).toFixed(2),
    }));
    dispatch(clearCart());
    setCheckoutMode(false);

    // replace, not push, so the emptied cart does not sit behind the confirmation screen.
    router.replace('/checkout-success')
  }

  useEffect(() => {
    if (router.query.checkout === 'true') {
      setCheckoutMode(true);
    }
  }, [router.query.checkout]);

  useEffect(() => {
    if (cartItems.length === 0) {
      setCheckoutMode(false)
    }
  }, [cartItems])

  return (
    <div className="flex flex-col pb-[33px]">

      <div className="flex justify-between items-center">
        <h4 className="h4-bold">{cartTotalQuantity} items here</h4>
      </div>

      <CartItemsList items={cartItems} showDefaultItems={showDefaultItems} />

      {isCheckoutMode && <CheckoutDetails />}

      <CartSummary isCheckoutMode={isCheckoutMode} isEmpty={cartItems.length === 0} onCheckout={handleProceedToCheckout} />

      <BottomNavBar className='mt-2.5' />

    </div>
  )
}
