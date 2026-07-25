import { render, screen, fireEvent } from "@testing-library/react";
import CartSummary from "./CartSummary";
import * as hooks from "@/app/providers/store-provider/config/hooks";
import { allPriceCart as allPriceCartSelector } from "@/entities/cart/model/cart.slice";
import { serviceFee as serviceFeeSelector } from "@/entities/payment/model/payment.slice";

jest.mock("@/app/providers/store-provider/config/hooks", () => ({
  useAppSelector: jest.fn(),
}));

describe("CartSummary component", () => {
  const mockUseAppSelector = hooks.useAppSelector as jest.Mock;
  const mockCheckout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });
    // Renders the total price correctly
  it("renders total price correctly", () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector === allPriceCartSelector) return 100;
      if (selector === serviceFeeSelector) return 10;
    });

    render(<CartSummary isEmpty={false} isCheckoutMode={true} onCheckout={mockCheckout} />);

    expect(screen.getByText("Total : $110.00")).toBeInTheDocument();
    expect(screen.getByText("Includes a $10.00 service fee")).toBeInTheDocument();
  });

      // Renders the total price correctly when isCheckoutMode is false
  it("renders total price correctly", () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector === allPriceCartSelector) return 100;
      if (selector === serviceFeeSelector) return 10;
    });

    render(<CartSummary isEmpty={false} isCheckoutMode={false} onCheckout={mockCheckout} />);

    expect(screen.getByText("Total : $100.00")).toBeInTheDocument();
    expect(screen.getByText("Service fee added at checkout")).toBeInTheDocument();
  });

  // Shows a total of 0 when the cart is empty
  it("renders total as 0 if cart is empty", () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector === allPriceCartSelector) return 0;
      if (selector === serviceFeeSelector) return 10;
    });

    render(<CartSummary isEmpty={true} isCheckoutMode={false} onCheckout={mockCheckout} />);

    expect(screen.getByText("Total : $0.00")).toBeInTheDocument();
  });

  // Disables the button when the cart is empty
  it("disables the button when cart is empty", () => {
    mockUseAppSelector.mockReturnValue(0);

    render(<CartSummary isEmpty={true} isCheckoutMode={false} onCheckout={mockCheckout} />);

    const button = screen.getByRole("button", { name: /proceed to checkout/i });
    expect(button).toBeDisabled();
  });

  // Fires the checkout handler when the button is clicked
  it("calls onCheckout when button clicked", () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector === allPriceCartSelector) return 200;
      if (selector === serviceFeeSelector) return 20;
    });

    render(<CartSummary isEmpty={false} isCheckoutMode={false} onCheckout={mockCheckout} />);

    const button = screen.getByRole("button", { name: /proceed to checkout/i });
    fireEvent.click(button);

    expect(mockCheckout).toHaveBeenCalledTimes(1);
  });
  // The button says what the next press will actually do
  it("labels the button for the step it performs", () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector === allPriceCartSelector) return 100;
      if (selector === serviceFeeSelector) return 10;
    });

    const { rerender } = render(
      <CartSummary isEmpty={false} isCheckoutMode={false} onCheckout={mockCheckout} />
    );
    expect(screen.getByRole("button", { name: /proceed to checkout/i })).toBeInTheDocument();

    rerender(<CartSummary isEmpty={false} isCheckoutMode={true} onCheckout={mockCheckout} />);
    expect(screen.getByRole("button", { name: /place order/i })).toBeInTheDocument();
  });

  // The removed discount promise must not come back
  it("does not promise a discount", () => {
    mockUseAppSelector.mockReturnValue(0);

    render(<CartSummary isEmpty={false} isCheckoutMode={true} onCheckout={mockCheckout} />);

    expect(screen.queryByText(/discount/i)).not.toBeInTheDocument();
  });
});
