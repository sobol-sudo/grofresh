import { render, screen } from "@testing-library/react";
import CheckoutSummary from "./CheckoutSummary";
import * as hooks from "@/app/providers/store-provider/config/hooks";
import { serviceFee, paymentMethod as paymentMethodSelector } from "@/entities/payment/model/payment.slice";
import { allPriceCart as allPriceCartSelector } from "@/entities/cart/model/cart.slice";

// Mock useAppSelector
jest.mock("@/app/providers/store-provider/config/hooks", () => ({
  useAppSelector: jest.fn(),
}));

describe("CheckoutSummary", () => {
  const useAppSelectorMock = hooks.useAppSelector as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders payment method, service fee and total price correctly", () => {
    const mockState = {
      serviceFee: "1.50",
      allPriceCart: "100",
      paymentMethod: "Mastercard",
    };

    useAppSelectorMock.mockImplementation((selector: unknown) => {
      if (selector === serviceFee) return mockState.serviceFee;
      if (selector === allPriceCartSelector) return mockState.allPriceCart;
      if (selector === paymentMethodSelector) return mockState.paymentMethod;
      return null;
    });

    render(<CheckoutSummary />);

    expect(screen.getByText("Mastercard")).toBeInTheDocument();
    expect(screen.getByText("$1.50")).toBeInTheDocument();
    expect(screen.getByText("$101.50")).toBeInTheDocument();
  });
});
