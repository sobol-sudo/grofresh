import Button from "@/shared/ui/Button";
import { useRouter } from "next/router";
import type { Order } from "@/entities/order";

interface PaymentDetailsProps {
  order: Order;
}

export default function PaymentDetails({ order }: PaymentDetailsProps) {
  const router = useRouter()

  const itemCount = order.items.reduce((acc, item) => acc + item.quantity, 0)

  const navigateToHome = () => {
    document.body.style.transition = `none`
    router.replace('/')
  }

  return (
    <div className="container flex flex-col bg-white p-[16px_24px] rounded-[10px_10px_0_0]">
      <p className="h4-bold">Summary details</p>

      <div className="shadow mt-[22px] bg-white p-4 rounded-[30px]">
        <div className="flex justify-between">
          <span className="h6-bold">Transaction code</span>
          <span className="h6-regular" data-testid="transaction-code">{order.transactionCode}</span>
        </div>

        <div className="w-full border-b border-light-silver mt-3 mb-2.5"></div>

        <div className="flex justify-between">
          <span className="h6-bold">Payment method</span>
          <span className="h6-regular">{order.paymentMethod}</span>
        </div>

        <div className="w-full border-b border-light-silver mt-3 mb-2.5"></div>

        <div className="flex justify-between">
          <span className="h6-bold">Date</span>
          <span className="h6-regular">{order.placedAt}</span>
        </div>

        <div className="w-full border-b border-light-silver mt-3 mb-2.5"></div>

        <div className="flex justify-between">
          <span className="h6-bold">Items</span>
          <span className="h6-regular">{itemCount}</span>
        </div>

        <div className="w-full border-b border-light-silver mt-3 mb-2.5"></div>

        <div className="flex justify-between">
          <span className="h6-bold">Sub total</span>
          <span className="h6-regular">${order.subtotal}</span>
        </div>

        <div className="w-full border-b border-light-silver mt-3 mb-2.5"></div>

        <div className="flex justify-between">
          <span className="h6-bold">Fee</span>
          <span className="h6-regular">${order.serviceFee}</span>
        </div>

        <div className="w-full border-b border-light-silver mt-3 mb-2.5"></div>

        <div className="flex justify-between">
          <span className="h6-bold">Status</span>
          <span className="h6-regular">{'✅ Success'}</span>
        </div>

        <div className="w-full border-b border-light-silver mt-3 mb-2.5"></div>

        <div className="flex justify-between">
          <span className="h5-bold">Total paid</span>
          <span className="h6-bold">${order.total}</span>
        </div>

        <div className="w-full border-b border-light-silver mt-3 mb-2.5"></div>
      </div>

      <div className="flex flex-col gap-[7px] mt-2.5">
        <Button colorType="success" sx={{ height: '58px', borderRadius: '50px', textTransform: 'none', }} onClick={navigateToHome}>
          <span className="h5-bold">
            Back to home
          </span></Button>
      </div>
    </div>
  )
}
