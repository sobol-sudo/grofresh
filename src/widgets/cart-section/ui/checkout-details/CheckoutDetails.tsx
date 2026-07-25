import { useState } from "react";
import { useAppSelector } from "@/app/providers/store-provider/config/hooks";
import { allCards, currentCard, lastUsedCard } from "@/entities/payment/model/payment.slice";
import CheckoutSummary from "@/entities/payment/ui/checkout-summary";
import ActionOfferCard from "@/shared/ui/ActionOfferCard";
import PaymentCard from "@/shared/ui/PaymentCard";

export default function CheckoutDetails() {
  const [isPickerOpen, setPickerOpen] = useState(false)

  const lastCard = useAppSelector(lastUsedCard)
  const cards = useAppSelector(allCards)
  const selectedCard = useAppSelector(currentCard)

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="flex flex-col gap-2.5 mt-[22px]">
        <ActionOfferCard
          type="set-payment"
          text={selectedCard ? selectedCard.name : 'Set the payment method'}
          actionLabel={isPickerOpen ? 'Done' : 'Change'}
          onClick={() => setPickerOpen((open) => !open)}
        />

        {isPickerOpen && (
          <div className="flex flex-col gap-2.5" data-testid="payment-method-list">
            {cards.map((card) => (
              <PaymentCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-[22px]">
        <p className="h4-bold">Last use</p>

        <PaymentCard card={lastCard} isLastCard />
      </div>

      <CheckoutSummary />
    </div>
  )
}
