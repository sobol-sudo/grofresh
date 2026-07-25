import Button from "@/shared/ui/Button";
import { useRouter } from "next/router";
import type { Order } from "@/entities/order";

interface PaymentDetailsProps {
  order: Order;
}

export default function PaymentDetails({ order }: PaymentDetailsProps) {
  const router = useRouter()

  const itemCount = order.items.reduce((acc, item) => acc + item.quantity, 0)

  /*
    Both exits leave the same way. The receipt paints the page green, so the transition
    is killed before routing away — otherwise the body fades from green to white behind
    the next screen. And both `replace` rather than `push`: this screen is terminal, and
    the order that unlocks it is still in memory, so Back onto it would replay a receipt
    for a purchase that has already been acknowledged.
  */
  const leaveTo = (route: string) => {
    document.body.style.transition = `none`
    router.replace(route)
  }

  const navigateToOrderHistory = () => leaveTo('/orders')

  const navigateToHome = () => leaveTo('/')

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

      {/*
        The primary CTA is back, and it goes somewhere now. It used to be the green
        button on this screen with no handler at all — the order it was offering to show
        was already being persisted, there just was no screen to show it on. There is one.
      */}
      <div className="flex flex-col gap-[7px] mt-2.5">
        <Button colorType="success" sx={{ height: '58px', borderRadius: '50px', textTransform: 'none', }} onClick={navigateToOrderHistory}>
          <span className="h5-bold">
            Order history
          </span></Button>

        <Button sx={{ height: '58px', borderRadius: '50px', textTransform: 'none', }} onClick={navigateToHome}>
          <span className="h5-bold">
            Back to home
          </span></Button>
      </div>
    </div>
  )
}
