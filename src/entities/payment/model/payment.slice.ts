import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface Card {
  id: number;
  name: string;
  src: string
}

export interface PaymentState {
  serviceFee: string;
  cards: Card[]
  currentCard: Card | null,
  lastUsedCard: Card | null,
}

const MASTERCARD_IMAGE = '/images/payments/master-card.png'

const SAVED_CARDS: Card[] = [
  {
    id: 1,
    name: 'Mastercard •• 8802',
    src: MASTERCARD_IMAGE
  },
  {
    id: 2,
    name: 'Mastercard •• 4417',
    src: MASTERCARD_IMAGE
  }
]

const initialState: PaymentState = {
  serviceFee: '1.50',
  cards: SAVED_CARDS,
  currentCard: SAVED_CARDS[0],
  lastUsedCard: SAVED_CARDS[0]
}

export const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    // Picks the card to pay with. There is always exactly one selected card:
    // re-picking the current one is a no-op rather than a way to unset it.
    toggleCurrentCard(state, action: PayloadAction<Card>) {
      const card = state.cards.find((el) => el.id === action.payload.id);

      if (card) {
        state.currentCard = card;
      }
    }
  }
})

export const { toggleCurrentCard } = paymentSlice.actions
export const paymentReducer = paymentSlice.reducer

export const serviceFee = (state: { payment: PaymentState }) => state.payment.serviceFee
export const currentCard = (state: { payment: PaymentState }) => state.payment.currentCard
export const allCards = (state: { payment: PaymentState }) => state.payment.cards
export const lastUsedCard = (state: { payment: PaymentState }) => state.payment.lastUsedCard
export const paymentMethod = (state: { payment: PaymentState }) => state.payment.currentCard?.name
