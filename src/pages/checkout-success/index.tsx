import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAppSelector } from "@/app/providers/store-provider/config/hooks";
import { lastOrder } from "@/entities/order";
import { useBodyBackground } from "@/shared/hooks/useBodyBackground/useBodyBackground"
import CheckoutSuccessSection from "@/widgets/checkout-success-section";

export default function CheckoutSuccess() {
  const router = useRouter();
  const order = useAppSelector(lastOrder);

  useBodyBackground("#00824B");

  // There is no receipt without an order: a deep link or a reload lands on the catalog.
  useEffect(() => {
    if (!order) {
      router.replace('/');
    }
  }, [order, router]);

  if (!order) return null;

  return (
    <div className="pt-[38px] h-full overflow-x-hidden">
      <CheckoutSuccessSection order={order} />
    </div>
  )
}
