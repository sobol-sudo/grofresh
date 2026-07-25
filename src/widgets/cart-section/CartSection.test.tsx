/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import CartSection from "./CartSection";
import { rootReducer } from "@/app/providers/store-provider/config/rootReducer";
import { IProduct } from "@/entities/product";
import { useRouter } from "next/router";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/cart"),
}));

// eslint-disable-next-line @next/next/no-img-element
jest.mock("next/image", () => ({ src, alt }: any) => <img src={src} alt={alt} />);

jest.mock("./ui/cart-items-list", () => ({ items }: any) => (
  <div data-testid="cart-items">{items.length} items</div>
));

const product = (id: number, price: number, quantity: number): IProduct => ({
  id,
  src: `/images/products/${id}.png`,
  name: `Product ${id}`,
  unitValue: 1,
  unit: "kg",
  price,
  category: "Vegetables",
  category_id: 1,
  quantity,
});

const createStore = (items: IProduct[]) =>
  configureStore({
    reducer: rootReducer,
    preloadedState: {
      cart: { items, selectedProduct: null },
    },
  });

describe("CartSection checkout flow", () => {
  const mockReplace = jest.fn();

  const renderCart = (items: IProduct[]) => {
    const store = createStore(items);
    render(
      <Provider store={store}>
        <CartSection />
      </Provider>
    );
    return store;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace, push: jest.fn(), query: {} });
  });

  // The first press reveals the checkout details, the second one pays
  it("takes two clearly labelled steps to buy", () => {
    renderCart([product(1, 2.5, 2)]);

    const button = screen.getByRole("button", { name: /proceed to checkout/i });
    fireEvent.click(button);

    expect(screen.getByRole("button", { name: /place order/i })).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  // Placing the order hands the cart to the receipt and empties it
  it("records the order and clears the cart", () => {
    const store = renderCart([product(1, 2.5, 2), product(2, 1, 1)]);

    fireEvent.click(screen.getByRole("button", { name: /proceed to checkout/i }));
    fireEvent.click(screen.getByRole("button", { name: /place order/i }));

    const { cart, order } = store.getState();

    expect(order.lastOrder).not.toBeNull();
    expect(order.lastOrder?.subtotal).toBe("6.00");
    expect(order.lastOrder?.serviceFee).toBe("1.50");
    expect(order.lastOrder?.total).toBe("7.50");
    expect(order.lastOrder?.items).toHaveLength(2);
    expect(order.lastOrder?.transactionCode).toHaveLength(10);

    expect(cart.items).toHaveLength(0);
  });

  // Back must not return to a re-armed cart, so the route is replaced
  it("replaces the cart route with the confirmation screen", () => {
    renderCart([product(1, 2.5, 2)]);

    fireEvent.click(screen.getByRole("button", { name: /proceed to checkout/i }));
    fireEvent.click(screen.getByRole("button", { name: /place order/i }));

    expect(mockReplace).toHaveBeenCalledWith("/checkout-success");
  });

  // Once the cart is empty the purchase cannot be repeated
  it("cannot place a second order from an emptied cart", () => {
    const store = renderCart([product(1, 2.5, 2)]);

    fireEvent.click(screen.getByRole("button", { name: /proceed to checkout/i }));
    fireEvent.click(screen.getByRole("button", { name: /place order/i }));

    const firstCode = store.getState().order.lastOrder?.transactionCode;
    mockReplace.mockClear();

    const button = screen.getByRole("button", { name: /proceed to checkout/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);

    expect(mockReplace).not.toHaveBeenCalled();
    expect(store.getState().order.lastOrder?.transactionCode).toBe(firstCode);
  });

  // The "more" link pointed at a screen that does not exist
  it("renders no dead 'more' link", () => {
    renderCart([product(1, 2.5, 2)]);
    expect(screen.queryByText("more")).not.toBeInTheDocument();
  });
});
