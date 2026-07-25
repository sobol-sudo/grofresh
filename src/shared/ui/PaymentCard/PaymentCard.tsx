import Image from "next/image";
import Checkbox from "../Checkbox";
import { useAppDispatch, useAppSelector } from "@/app/providers/store-provider/config/hooks";
import { Card, toggleCurrentCard } from "@/entities/payment/model/payment.slice";

interface PaymentCardProps {
  card: Card | null,
  isLastCard?: boolean;
}

export default function PaymentCard({ card, isLastCard }: PaymentCardProps) {
  const selectedCard = useAppSelector((state) => state.payment.currentCard);
  const dispatch = useAppDispatch()

  /**
   * The "Last use" row is a record of what was used before, not a third place to pick
   * a card — the picker above it is the one control that changes the payment method.
   * It is therefore rendered without a click handler and with its checkbox disabled,
   * rather than looking tappable and swallowing the tap.
   */
  const toggleCard = () => {
    if (!card || isLastCard) return

    dispatch(toggleCurrentCard(card))
  }

  if (!card) return null;

  const isSelected = selectedCard?.id === card.id;

  return (
    <div
      className={`shadow bg-white p-4 rounded-[30px] flex items-center select-none ${isLastCard ? '' : 'cursor-pointer'}`}
      onClick={toggleCard}
      data-testid="payment-card"
    >

      <div className="rounded-full flex justify-center items-center">
        <Image src={card.src} width={50} height={50} alt="payment-method" />
      </div>

      <span className="small-regular ml-2.5">{card.name}</span>

      <Checkbox sx={{ marginLeft: 'auto' }} checked={isSelected} disabled={isLastCard} />
    </div>
  )
}