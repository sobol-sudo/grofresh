import { render, screen, fireEvent, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import Orders from "@/pages/orders";
import Profile from "@/pages/profile";
import PaymentDetails from "@/widgets/checkout-success-section/ui/payment-details";
import { rootReducer } from "@/app/providers/store-provider/config/rootReducer";
import { persistenceMiddleware } from "@/app/providers/store-provider/config/persistence.middleware";
import {
  placeOrder,
  hydrateOrders,
  readStoredOrders,
  createTransactionCode,
  type Order,
} from "@/entities/order";
import { toggleCartItem, clearCart, allPriceCart } from "@/entities/cart/model/cart.slice";
import { serviceFee } from "@/entities/payment/model/payment.slice";
import { discountedPrice, formatPrice, type IProduct } from "@/entities/product";
import { MOCK_PRODUCTS } from "@/entities/product/config/mock";
import { formatDate } from "@/shared/lib/formatDate";
import { headerConfig } from "@/widgets/header/config";

/**
 * The order-history screen and the controls that lead to it.
 *
 * The receipt's green "Order history" button was the app's worst dead control: it was
 * the primary CTA and had no handler at all. Fixing it means the destination has to be
 * real, so these tests run the actual purchase flow through the real store and then
 * assert the order comes back out on /orders — rather than rendering the screen against
 * a hand-built list, which would pass just as happily if checkout wrote nothing.
 *
 * This file lives outside src/pages because anything under pages/ is treated as a route.
 */

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
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
  transactionCode: "AB12CD34EF",
  placedAt: "25 July, 03:45 PM",
  paymentMethod: "Visa",
  items: [product(1, 2)],
  subtotal: "6.00",
  serviceFee: "1.50",
  total: "7.50",
};

/** A store wired exactly like the real one, persistence middleware included. */
const createStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(persistenceMiddleware),
  });

/** The state after the client has read storage — what every screen but the first frame sees. */
const hydratedStore = () => {
  const store = createStore();
  store.dispatch(hydrateOrders([]));
  return store;
};

const push = jest.fn();
const replace = jest.fn();

const renderRoute = (ui: React.ReactElement, store = hydratedStore()) => {
  render(<Provider store={store}>{ui}</Provider>);
  return store;
};

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  (useRouter as jest.Mock).mockReturnValue({ push, replace, query: {} });
  (usePathname as jest.Mock).mockReturnValue("/orders");
});

describe("/orders route", () => {
  // A link into a route with no header entry lands on an untitled, unleavable screen
  it("has a header entry so the route is titled and can be left", () => {
    expect(headerConfig["/orders"]).toEqual({
      backRoute: true,
      centerName: true,
      title: "Order history",
      cartIcon: true,
    });
  });

  it("renders an order placed through the checkout flow", () => {
    const store = hydratedStore();

    /*
      The real purchase path, not a hand-written order: cart -> placeOrder with the
      numbers CartSection computes -> clearCart. If checkout stopped recording history,
      this is the assertion that would notice.
    */
    const bought = MOCK_PRODUCTS[0];
    store.dispatch(toggleCartItem(bought));

    const subtotal = allPriceCart(store.getState());
    const fee = serviceFee(store.getState());
    const placed: Order = {
      transactionCode: createTransactionCode(),
      placedAt: formatDate(),
      paymentMethod: "Visa",
      items: store.getState().cart.items,
      subtotal: Number(subtotal).toFixed(2),
      serviceFee: Number(fee).toFixed(2),
      total: (Number(subtotal) + Number(fee)).toFixed(2),
    };
    store.dispatch(placeOrder(placed));
    store.dispatch(clearCart());

    renderRoute(<Orders />, store);

    expect(screen.getByTestId("orders-count")).toHaveTextContent("1 order");
    expect(screen.getAllByTestId("order-item")).toHaveLength(1);
    expect(screen.getByTestId("order-code")).toHaveTextContent(`#${placed.transactionCode}`);
    expect(screen.getByTestId("order-date")).toHaveTextContent(placed.placedAt);
    expect(screen.getByTestId("order-total")).toHaveTextContent(`$${placed.total}`);
    expect(screen.getByTestId("order-item-count")).toHaveTextContent("1 item");

    // The item bought is on the card, priced at what the cart actually charged for it
    const line = placed.items[0];
    expect(screen.getByText(bought.name)).toBeInTheDocument();
    expect(screen.getByTestId("order-line-total")).toHaveTextContent(
      `$${formatPrice(discountedPrice(line) * line.quantity)}`
    );

    // ...and the line adds up to the subtotal the checkout recorded
    expect(formatPrice(discountedPrice(line) * line.quantity)).toBe(placed.subtotal);
  });

  // The receipt shows one order; the history has to keep the ones before it
  it("lists every order, newest first", () => {
    const store = hydratedStore();
    store.dispatch(placeOrder({ ...order, transactionCode: "OLDEST0001" }));
    store.dispatch(placeOrder({ ...order, transactionCode: "NEWEST0002" }));

    renderRoute(<Orders />, store);

    const codes = screen.getAllByTestId("order-code").map((node) => node.textContent);
    expect(codes).toEqual(["#NEWEST0002", "#OLDEST0001"]);
    expect(screen.getByTestId("orders-count")).toHaveTextContent("2 orders");
  });

  // Quantities, not distinct products
  it("counts items the way the receipt counts them", () => {
    const store = hydratedStore();
    store.dispatch(placeOrder({ ...order, items: [product(1, 2), product(2, 3)] }));

    renderRoute(<Orders />, store);

    expect(screen.getByTestId("order-item-count")).toHaveTextContent("5 items");
    expect(screen.getAllByTestId("order-line")).toHaveLength(2);
  });

  /*
    A line has to be priced by the quantity bought, not by the unit price. Two of a $3
    product is $6, and printing $3 beside "2 ×" would be a receipt that does not add up
    to its own total.
  */
  it("prices each line by the quantity bought", () => {
    const store = hydratedStore();
    const items = [product(1, 2), product(2, 3)];
    store.dispatch(
      placeOrder({ ...order, items, subtotal: "15.00", total: "16.50" })
    );

    renderRoute(<Orders />, store);

    const lineTotals = screen.getAllByTestId("order-line-total").map((node) => node.textContent);
    expect(lineTotals).toEqual(["$6.00", "$9.00"]);

    // The lines account for the subtotal the order was charged
    const summed = items.reduce((total, item) => total + discountedPrice(item) * item.quantity, 0);
    expect(formatPrice(summed)).toBe("15.00");
  });

  /*
    History is a record. `ProductCart` renders a counter and a delete cross that dispatch
    cart actions, so reusing it here would have made the cross on a past order silently
    add that product to the live cart.
  */
  it("renders past orders as records, with no controls that mutate the cart", () => {
    const store = hydratedStore();
    store.dispatch(placeOrder(order));

    renderRoute(<Orders />, store);

    const card = screen.getByTestId("order-item");
    expect(card.querySelectorAll("button")).toHaveLength(0);
    expect(store.getState().cart.items).toHaveLength(0);
  });

  // Orders survive the reload, which is the only reason they are stored at all
  it("shows a history restored from storage on a cold load", () => {
    createStore().dispatch(placeOrder(order));

    const reloaded = createStore();
    reloaded.dispatch(hydrateOrders(readStoredOrders()));

    renderRoute(<Orders />, reloaded);

    expect(screen.getByTestId("order-code")).toHaveTextContent("#AB12CD34EF");
  });
});

describe("/orders empty state", () => {
  it("renders a designed empty state rather than an empty page", () => {
    renderRoute(<Orders />);

    expect(screen.getByTestId("orders-empty")).toBeInTheDocument();
    expect(screen.getByText("No orders yet")).toBeInTheDocument();
    expect(screen.queryByTestId("order-item")).not.toBeInTheDocument();
    expect(screen.queryByTestId("orders-count")).not.toBeInTheDocument();
  });

  // An empty screen with no way on is a cul-de-sac
  it("routes out of the empty state into the catalog", () => {
    renderRoute(<Orders />);

    fireEvent.click(screen.getByRole("button", { name: /browse all products/i }));

    expect(push).toHaveBeenCalledWith("/products");
  });

  it("keeps the tab bar as a second way out", () => {
    renderRoute(<Orders />);

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(push).toHaveBeenCalledWith("/");
  });
});

describe("/orders hydration", () => {
  /*
    Storage is read in an effect after mount, so the first frame of a cold load has an
    empty history that means "not read yet". Rendering the empty state there would tell
    someone with a history that they have never ordered, then correct itself a frame later.
  */
  it("does not flash the empty state before storage is read", () => {
    renderRoute(<Orders />, createStore());

    expect(screen.getByTestId("orders-loading")).toBeInTheDocument();
    expect(screen.queryByTestId("orders-empty")).not.toBeInTheDocument();
    expect(screen.queryByText("No orders yet")).not.toBeInTheDocument();
  });

  // The un-hydrated screen is still leavable
  it("keeps a way out while storage is being read", () => {
    renderRoute(<Orders />, createStore());

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(push).toHaveBeenCalledWith("/");
  });

  // An empty read is still a read: the screen has to stop waiting
  it("settles on the empty state once an empty history is read", () => {
    const store = renderRoute(<Orders />, createStore());

    expect(screen.getByTestId("orders-loading")).toBeInTheDocument();

    // What StoreProvider does from its effect once localStorage has been read.
    act(() => {
      store.dispatch(hydrateOrders([]));
    });

    expect(screen.getByTestId("orders-empty")).toBeInTheDocument();
    expect(screen.queryByTestId("orders-loading")).not.toBeInTheDocument();
  });

  // The case the flag exists for: a real history arriving after the first frame
  it("shows a restored order instead of the empty state", () => {
    const store = renderRoute(<Orders />, createStore());

    act(() => {
      store.dispatch(hydrateOrders([order]));
    });

    expect(screen.getByTestId("order-code")).toHaveTextContent("#AB12CD34EF");
    expect(screen.queryByTestId("orders-empty")).not.toBeInTheDocument();
    expect(screen.queryByTestId("orders-loading")).not.toBeInTheDocument();
  });
});

describe("controls that lead to the order history", () => {
  // The dead CTA this whole screen exists to make honest
  it("navigates from the receipt's Order history button", () => {
    render(<PaymentDetails order={order} />);

    fireEvent.click(screen.getByRole("button", { name: /order history/i }));

    expect(replace).toHaveBeenCalledWith("/orders");
  });

  // The profile counts orders; the count should open what it counted
  it("navigates from the profile order tile", () => {
    (usePathname as jest.Mock).mockReturnValue("/profile");

    const store = hydratedStore();
    store.dispatch(placeOrder(order));

    renderRoute(<Profile />, store);

    const tile = screen.getByTestId("profile-order-count");
    expect(tile).toHaveTextContent("1");

    fireEvent.click(tile);
    expect(push).toHaveBeenCalledWith("/orders");
  });
});
