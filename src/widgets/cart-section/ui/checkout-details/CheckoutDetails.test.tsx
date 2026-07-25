/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import { render, screen, fireEvent } from "@testing-library/react";
import CheckoutDetails from "./CheckoutDetails";
import * as hooks from "@/app/providers/store-provider/config/hooks";
import { allCards, currentCard, lastUsedCard } from "@/entities/payment/model/payment.slice";

jest.mock("@/app/providers/store-provider/config/hooks", () => ({
  useAppSelector: jest.fn(),
}));

jest.mock("@/shared/ui/ActionOfferCard", () => ({ type, text, actionLabel, onClick }: any) => (
  <div data-testid={`action-${type}`}>
    {text}
    <button onClick={onClick}>{actionLabel}</button>
  </div>
));

jest.mock("@/shared/ui/PaymentCard", () => ({ card, isLastCard }: any) => (
  <div data-testid="payment-card">
    PaymentCard - {card ? card.name : "no card"} {isLastCard && "(last)"}
  </div>
));

jest.mock("@/entities/payment/ui/checkout-summary", () => () => (
  <div data-testid="checkout-summary">CheckoutSummary</div>
));

describe("CheckoutDetails component", () => {
  const mockUseAppSelector = hooks.useAppSelector as jest.Mock;

  const cards = [
    { id: 1, name: "Mastercard •• 8802", src: "/images/payments/master-card.png" },
    { id: 2, name: "Mastercard •• 4417", src: "/images/payments/master-card.png" },
  ];

  const mockSelectors = ({ current }: { current: (typeof cards)[number] | null }) => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector === allCards) return cards;
      if (selector === currentCard) return current;
      if (selector === lastUsedCard) return cards[0];
      return null;
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all main sections", () => {
    mockSelectors({ current: cards[0] });

    render(<CheckoutDetails />);

    expect(screen.getByTestId("action-set-payment")).toBeInTheDocument();
    expect(screen.getByTestId("checkout-summary")).toBeInTheDocument();
    expect(screen.getByText("Last use")).toBeInTheDocument();
  });

  it("shows the selected card on the payment row", () => {
    mockSelectors({ current: cards[1] });

    render(<CheckoutDetails />);

    expect(screen.getByTestId("action-set-payment")).toHaveTextContent("Mastercard •• 4417");
  });

  it("prompts to pick a card when none is selected", () => {
    mockSelectors({ current: null });

    render(<CheckoutDetails />);

    expect(screen.getByTestId("action-set-payment")).toHaveTextContent("Set the payment method");
  });

  it("opens an inline list of saved cards instead of navigating away", () => {
    mockSelectors({ current: cards[0] });

    render(<CheckoutDetails />);

    expect(screen.queryByTestId("payment-method-list")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Change" }));

    const list = screen.getByTestId("payment-method-list");
    expect(list).toBeInTheDocument();
    expect(list).toHaveTextContent("Mastercard •• 8802");
    expect(list).toHaveTextContent("Mastercard •• 4417");
  });

  it("closes the card list again", () => {
    mockSelectors({ current: cards[0] });

    render(<CheckoutDetails />);

    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(screen.queryByTestId("payment-method-list")).not.toBeInTheDocument();
  });

  it("renders the last used card as a non-selectable row", () => {
    mockSelectors({ current: cards[0] });

    render(<CheckoutDetails />);

    expect(screen.getAllByTestId("payment-card")[0]).toHaveTextContent("(last)");
  });

  it("no longer offers a discount code control", () => {
    mockSelectors({ current: cards[0] });

    render(<CheckoutDetails />);

    expect(screen.queryByTestId("action-apply-discount")).not.toBeInTheDocument();
    expect(screen.queryByText("Use discount code here")).not.toBeInTheDocument();
  });
});
