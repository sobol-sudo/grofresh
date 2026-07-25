/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import CheckoutSuccess from "@/pages/checkout-success";
import { rootReducer } from "@/app/providers/store-provider/config/rootReducer";
import { Order } from "@/entities/order";
import { IProduct } from "@/entities/product";
import { useRouter } from "next/router";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/widgets/checkout-success-section", () => ({ order }: any) => (
  <div data-testid="success-section">{order.transactionCode}</div>
));

const product = (id: number): IProduct => ({
  id,
  src: `/images/products/${id}.png`,
  name: `Product ${id}`,
  unitValue: 1,
  unit: "kg",
  price: 3,
  category: "Vegetables",
  category_id: 1,
  quantity: 1,
});

const order: Order = {
  transactionCode: "ABCDEFGHJK",
  placedAt: "24 July, 10:00 AM",
  paymentMethod: "Mastercard •• 8802",
  items: [product(1)],
  subtotal: "3.00",
  serviceFee: "1.50",
  total: "4.50",
};

// This test lives outside src/pages: any file under pages/ is treated as a route.
describe("checkout-success route guard", () => {
  const mockReplace = jest.fn();

  const renderPage = (lastOrder: Order | null) => {
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: {
        order: {
          orders: lastOrder ? [lastOrder] : [],
          lastOrder,
          isHydrated: true,
        },
      },
    });

    return render(
      <Provider store={store}>
        <CheckoutSuccess />
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
  });

  // Deep-linking the receipt used to render a fabricated $0.00 order
  it("redirects to the catalog when no order was placed", () => {
    renderPage(null);

    expect(mockReplace).toHaveBeenCalledWith("/");
    expect(screen.queryByTestId("success-section")).not.toBeInTheDocument();
  });

  // A real order renders and stays put
  it("renders the receipt for a placed order", () => {
    renderPage(order);

    expect(screen.getByTestId("success-section")).toHaveTextContent("ABCDEFGHJK");
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
