import { useEffect, useRef } from "react";
import type { Order } from "@/entities/order";
import PaymentDetails from "./ui/payment-details";
import PaymentStatus from "./ui/payment-status";
import './checkout-success-section.css'

interface CheckoutSuccessSectionProps {
  order: Order;
}

export default function CheckoutSuccessSection({ order }: CheckoutSuccessSectionProps) {
  const slideUpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = slideUpRef.current;
    if (!element) return;

    const handleAnimationEnd = () => {
      element.classList.add('animation-complete');
    };

    element.addEventListener('animationend', handleAnimationEnd);
    
    return () => {
      element.removeEventListener('animationend', handleAnimationEnd);
    };
  }, []);

  return (
    <div className="relative h-full flex flex-col gap-[27px] overflow-hidden">
      <div className="h-full flex flex-col items-center justify-center">
        <PaymentStatus />
      </div>

      <div ref={slideUpRef} className="slide-up">
        <PaymentDetails order={order} />
      </div>
    </div>
  )
}