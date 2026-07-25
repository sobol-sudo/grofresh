import { useAppSelector } from "@/app/providers/store-provider/config/hooks";
import Button from "@/shared/ui/Button";
import { allPriceCart as allPriceCartSelector } from "@/entities/cart/model/cart.slice"
import { serviceFee as serviceFeeSelector } from "@/entities/payment/model/payment.slice"
interface CartSummaryProps {
  isEmpty: boolean;
  isCheckoutMode: boolean;
  onCheckout: () => void
}

export default function CartSummary({ isEmpty, isCheckoutMode, onCheckout }: CartSummaryProps) {
  const serviceFee = useAppSelector(serviceFeeSelector)
  const allPriceCart = useAppSelector(allPriceCartSelector)

  const totalPrice = (Number(allPriceCart) > 0 ? Number(allPriceCart) + Number(serviceFee) : 0).toFixed(2)

  return (
    <div className="mt-[7px] py-6">
      <div className="flex flex-col gap-[5px]">
        <p className="h3-bold">Total : ${isCheckoutMode ? totalPrice : Number(allPriceCart).toFixed(2)}</p>
        <span className="h6-regular">
          {isCheckoutMode
            ? `Includes a $${Number(serviceFee).toFixed(2)} service fee`
            : 'Service fee added at checkout'}
        </span>
      </div>

      <Button
        disabled={isEmpty}
        colorType="success"
        sx={{
          height: 65,
          borderRadius: 50,
          width: '100%',
          marginTop: '19px',
          textTransform: 'none',
        }}
        onClick={onCheckout}
      >
        <span className="h5-bold">
          {isCheckoutMode ? 'Place order' : 'Proceed to checkout'}
        </span>
      </Button>
    </div>
  )
}