import { render, screen, fireEvent } from "@testing-library/react";
import PaymentDetails from "./PaymentDetails";
import { useRouter } from "next/router";
import type { Order } from "@/entities/order";
import { IProduct } from "@/entities/product";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

const product = (id: number, quantity: number): IProduct => ({
  id,
  src: `/images/products/${id}.png`,
  name: `Product ${id}`,
  unitValue: 1,
  unit: "kg",
  price: 3,
  category: "Vegetables",
  category_id: 1,
  quantity,
});

const order: Order = {
  transactionCode: "ABCDEFGHJK",
  placedAt: "24 July, 10:00 AM",
  paymentMethod: "Mastercard •• 8802",
  items: [product(1, 2), product(2, 1)],
  subtotal: "9.00",
  serviceFee: "1.50",
  total: "10.50",
};

describe("PaymentDetails component", () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
  });

  // Every line comes from the order that was actually placed
  it("renders the receipt from the placed order", () => {
    render(<PaymentDetails order={order} />);

    expect(screen.getByTestId("transaction-code")).toHaveTextContent("ABCDEFGHJK");
    expect(screen.getByText("Mastercard •• 8802")).toBeInTheDocument();
    expect(screen.getByText("24 July, 10:00 AM")).toBeInTheDocument();
    expect(screen.getByText("$9.00")).toBeInTheDocument();
    expect(screen.getByText("$1.50")).toBeInTheDocument();
    expect(screen.getByText("$10.50")).toBeInTheDocument();
  });

  // The old screen showed a hardcoded transaction code
  it("does not show a hardcoded transaction code", () => {
    render(<PaymentDetails order={order} />);
    expect(screen.queryByText("556DTXGR89")).not.toBeInTheDocument();
  });

  // Subtotal and fee must add up to the total on screen
  it("shows a subtotal that agrees with the fee and total", () => {
    render(<PaymentDetails order={order} />);

    const subtotal = Number(screen.getByText("$9.00").textContent?.replace("$", ""));
    const fee = Number(screen.getByText("$1.50").textContent?.replace("$", ""));
    const total = Number(screen.getByText("$10.50").textContent?.replace("$", ""));

    expect(subtotal + fee).toBeCloseTo(total);
  });

  // Item count reflects quantities, not just distinct products
  it("counts the purchased items", () => {
    render(<PaymentDetails order={order} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  /*
    "Order history" was this screen's green primary CTA with no onClick whatsoever, and
    the previous fix was to delete it — the history it promised had nowhere to be shown.
    /orders exists now, so the button is back, and the thing worth asserting is no longer
    that there is one exit but that every exit on the screen actually goes somewhere.
  */
  it("offers two exits and no dead control", () => {
    render(<PaymentDetails order={order} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent("Order history");
    expect(buttons[1]).toHaveTextContent("Back to home");

    buttons.forEach((button) => {
      mockReplace.mockClear();
      fireEvent.click(button);
      expect(mockReplace).toHaveBeenCalledTimes(1);
    });
  });

  // The button that used to do nothing
  it("opens the order history", () => {
    render(<PaymentDetails order={order} />);

    fireEvent.click(screen.getByRole("button", { name: /order history/i }));

    expect(mockReplace).toHaveBeenCalledWith("/orders");
  });

  // Leaving replaces the terminal screen so it cannot be revisited with Back
  it("replaces the confirmation screen when going home", () => {
    render(<PaymentDetails order={order} />);

    fireEvent.click(screen.getByRole("button", { name: /back to home/i }));

    expect(mockReplace).toHaveBeenCalledWith("/");
  });
});
