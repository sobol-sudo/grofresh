import { paymentReducer, toggleCurrentCard, PaymentState, serviceFee, currentCard, allCards, lastUsedCard, paymentMethod } from "./payment.slice";

describe("paymentSlice reducer", () => {
  let initialState: PaymentState;

  beforeEach(() => {
    initialState = {
      serviceFee: '1.50',
      cards: [
        { id: 1, name: 'Mastercard •• 8802', src: '/images/payments/master-card.png' },
        { id: 2, name: 'Mastercard •• 4417', src: '/images/payments/master-card.png' },
      ],
      currentCard: { id: 1, name: 'Mastercard •• 8802', src: '/images/payments/master-card.png' },
      lastUsedCard: { id: 1, name: 'Mastercard •• 8802', src: '/images/payments/master-card.png' },
    };
  });

  // The reducer returns the initial state
  it("should return the initial state", () => {
    const state = paymentReducer(undefined, { type: "unknown" });
    expect(state).toEqual(initialState);
  });

  // Re-picking the selected card keeps it selected: checkout always has a payment method
  it("should keep the current card selected if it is picked again", () => {
    const action = toggleCurrentCard({ id: 1, name: 'Mastercard •• 8802', src: '' });
    const state = paymentReducer(initialState, action);
    expect(state.currentCard?.id).toBe(1);
  });

  // currentCard switches to a different card
  it("should set current card if different card is selected", () => {
    const action = toggleCurrentCard({ id: 2, name: 'Mastercard •• 4417', src: '' });
    const state = paymentReducer(initialState, action);
    expect(state.currentCard?.id).toBe(2);
    expect(state.currentCard?.name).toBe('Mastercard •• 4417');
  });

  // currentCard is unchanged when lastUsedCard is selected and it is the only card
  it("should not change currentCard if lastUsedCard is selected and only one card exists", () => {
    const singleCardState: PaymentState = {
      ...initialState,
      cards: [initialState.cards[0]],
      currentCard: initialState.cards[0],
    };
    const action = toggleCurrentCard({ id: 1, name: 'Mastercard •• 8802', src: '' });
    const state = paymentReducer(singleCardState, action);
    expect(state.currentCard?.id).toBe(1);
  });

  // currentCard is unchanged when an unknown id is passed
  it("should not set currentCard if card id not found", () => {
    const action = toggleCurrentCard({ id: 999, name: 'Unknown', src: '' });
    const state = paymentReducer(initialState, action);
    expect(state.currentCard?.id).toBe(1);
  });


  // Case: lastUsedCard is null
  it('should handle case when lastUsedCard is null', () => {
    const stateWithNoLastUsed = { ...initialState, lastUsedCard: null };
    const action = toggleCurrentCard({ id: 1, name: 'Mastercard •• 8802', src: '' });
    const newState = paymentReducer(stateWithNoLastUsed, action);

    // a card stays selected regardless of which one was used last
    expect(newState.currentCard?.id).toBe(1);
  });

  // A payment method can never be unset from the UI
  it('never leaves the checkout without a payment method', () => {
    let state = initialState;

    for (const card of initialState.cards) {
      state = paymentReducer(state, toggleCurrentCard(card));
      expect(state.currentCard).not.toBeNull();

      // picking the same card twice must not unset it
      state = paymentReducer(state, toggleCurrentCard(card));
      expect(state.currentCard?.id).toBe(card.id);
    }
  });
  
  // Case: currentCard is null
  it('should handle case when CurrentCard is null', () => {
    const stateCurrentCard = { ...initialState, currentCard: null };
    const action = toggleCurrentCard({ id: 1, name: 'Mastercard •• 8802', src: '' });
    const newState = paymentReducer(stateCurrentCard, action);

    // currentCard should not stay null
    expect(newState.currentCard).not.toBeNull();
  });
});


// Selector tests

describe('paymentSlice selectors', () => {
  let state: { payment: PaymentState };

  beforeEach(() => {
    state = {
      payment: {
        serviceFee: '1.50',
        cards: [
          { id: 1, name: 'Mastercard •• 8802', src: '/images/payments/master-card.png' },
          { id: 2, name: 'Mastercard •• 4417', src: '/images/payments/master-card.png' },
        ],
        currentCard: { id: 1, name: 'Mastercard •• 8802', src: '/images/payments/master-card.png' },
        lastUsedCard: { id: 1, name: 'Mastercard •• 8802', src: '/images/payments/master-card.png' },
      }
    };
  });

  // serviceFee selector
  it('serviceFee selector should return correct value', () => {
    expect(serviceFee(state)).toBe('1.50');
  });

  // currentCard selector
  it('currentCard selector should return the current card', () => {
    expect(currentCard(state)).toEqual(state.payment.currentCard);
  });

  // allCards selector
  it('allCards selector should return all cards', () => {
    expect(allCards(state)).toEqual(state.payment.cards);
  });

  // lastUsedCard selector
  it('lastUsedCard selector should return the last used card', () => {
    expect(lastUsedCard(state)).toEqual(state.payment.lastUsedCard);
  });

  // paymentMethod selector
  it('paymentMethod selector should return current card name', () => {
    expect(paymentMethod(state)).toBe('Mastercard •• 8802');

    // when currentCard is null
    state.payment.currentCard = null;
    expect(paymentMethod(state)).toBeUndefined();
  });
});
