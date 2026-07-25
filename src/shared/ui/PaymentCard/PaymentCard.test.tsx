import { render, screen, fireEvent } from "@testing-library/react";
import PaymentCard from "./PaymentCard";
import * as hooks from "@/app/providers/store-provider/config/hooks";
import { toggleCurrentCard } from "@/entities/payment/model/payment.slice";

// eslint-disable-next-line react/display-name, @next/next/no-img-element, @typescript-eslint/no-explicit-any
jest.mock("next/image", () => ({ src, alt }: any) => <img src={src} alt={alt} />);

jest.mock("@/app/providers/store-provider/config/hooks", () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

describe("PaymentCard component", () => {
  const mockDispatch = jest.fn();
  const card = { id: 1, name: "Mastercard", src: "/mastercard.png" };

  beforeEach(() => {
    jest.clearAllMocks();
    (hooks.useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  // Renders the card details
  it("renders card info correctly", () => {
    (hooks.useAppSelector as jest.Mock).mockReturnValue(card);

    render(<PaymentCard card={card} />);
    
    expect(screen.getByText("Mastercard")).toBeInTheDocument();
    expect(screen.getByAltText("payment-method")).toHaveAttribute("src", "/mastercard.png");
  });

  // Renders nothing when there is no card
  it("does not render if card is null", () => {
    render(<PaymentCard card={null} />);
    expect(screen.queryByText("Mastercard")).not.toBeInTheDocument();
  });

  // Dispatches toggleCurrentCard when the card is clicked
  it("dispatches toggleCurrentCard on card click", () => {
    (hooks.useAppSelector as jest.Mock).mockReturnValue(null);

    render(<PaymentCard card={card} />);
    
    fireEvent.click(screen.getByText("Mastercard"));
    
    expect(mockDispatch).toHaveBeenCalledWith(toggleCurrentCard(card));
  });

  // Does not dispatch when isLastCard is true
  it("does not dispatch if isLastCard is true", () => {
    (hooks.useAppSelector as jest.Mock).mockReturnValue(null);

    render(<PaymentCard card={card} isLastCard />);
    
    fireEvent.click(screen.getByText("Mastercard"));
    
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  // The checkbox reflects the checked state
  it("Checkbox reflects checked state", () => {
    (hooks.useAppSelector as jest.Mock).mockReturnValue(card);

    render(<PaymentCard card={card} />);
    
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });
});
