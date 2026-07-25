import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import Notifications from "@/pages/notifications";
import Profile from "@/pages/profile";
import Home from "@/pages/index";
import { rootReducer } from "@/app/providers/store-provider/config/rootReducer";
import { placeOrder, type Order } from "@/entities/order";
import { headerConfig } from "@/widgets/header/config";
import { IProduct } from "@/entities/product";

/**
 * The two screens restored behind the header bell and the Profile tab, rendered as
 * routes against the real store.
 *
 * The point of these is joinery: a control in the app shell has to land on a page that
 * exists, that page has to be titled and leavable, and what it shows has to come from
 * the same state the control counted. This file lives outside src/pages because
 * anything under pages/ is treated as a route.
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

const product: IProduct = {
  id: 1,
  src: "/images/products/1.png",
  name: "Bananas",
  unitValue: 1,
  unit: "kg",
  price: 2.2,
  category: "Fruits",
  category_id: 1,
  quantity: 2,
};

const order: Order = {
  transactionCode: "AB12CD34EF",
  placedAt: "25 July, 03:45 PM",
  paymentMethod: "Visa",
  items: [product],
  subtotal: "4.40",
  serviceFee: "1.50",
  total: "5.90",
};

const hydratedStore = () =>
  configureStore({
    reducer: rootReducer,
    preloadedState: {
      order: { orders: [], lastOrder: null, isHydrated: true },
      notification: { items: [], isHydrated: true },
    },
  });

const renderRoute = (ui: React.ReactElement, store = hydratedStore()) => {
  render(<Provider store={store}>{ui}</Provider>);
  return store;
};

describe("/notifications route", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push, query: {}, replace: jest.fn() });
    (usePathname as jest.Mock).mockReturnValue("/notifications");
  });

  it("renders its empty state rather than an empty page", () => {
    renderRoute(<Notifications />);

    expect(screen.getByTestId("notifications-empty")).toBeInTheDocument();
    expect(screen.getByText("No notifications yet")).toBeInTheDocument();
  });

  it("shows the notification an order actually produced", () => {
    const store = hydratedStore();
    store.dispatch(placeOrder(order));

    renderRoute(<Notifications />, store);

    expect(screen.getByTestId("notification-item")).toHaveTextContent(
      "2 items for $5.90, paid with Visa."
    );
    expect(screen.queryByTestId("notifications-empty")).not.toBeInTheDocument();
  });

  it("has a header entry so the route is titled and can be left", () => {
    expect(headerConfig["/notifications"]).toEqual({
      backRoute: true,
      centerName: true,
      title: "Notifications",
    });
  });
});

describe("/profile route", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push, query: {}, replace: jest.fn() });
    (usePathname as jest.Mock).mockReturnValue("/profile");
  });

  it("renders as a guest in a plain browser", () => {
    renderRoute(<Profile />);

    expect(screen.getByTestId("profile-name")).toHaveTextContent("Guest");
    expect(screen.getByTestId("profile-order-count")).toHaveTextContent("0");
  });

  it("counts an order that was really placed", () => {
    const store = hydratedStore();
    store.dispatch(placeOrder(order));

    renderRoute(<Profile />, store);

    expect(screen.getByTestId("profile-order-count")).toHaveTextContent("1");
    expect(screen.getByTestId("profile-last-order")).toHaveTextContent("AB12CD34EF");
    // Placing the order is also what created the notification the tile counts.
    expect(screen.getByTestId("profile-notifications-link")).toHaveTextContent("1");
  });

  it("has a header entry so the route is titled and can be left", () => {
    expect(headerConfig["/profile"]).toEqual({
      backRoute: true,
      centerName: true,
      title: "Profile",
    });
  });
});

describe("app shell reachability", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push, query: {}, replace: jest.fn() });
    (usePathname as jest.Mock).mockReturnValue("/");
  });

  // The tab bar used to exist only on the cart, which left the Profile tab one screen
  // deep from the home page it belongs on.
  it("puts the tab bar on the home page", () => {
    renderRoute(<Home />);

    expect(screen.getByRole("button", { name: "Profile" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Profile" }));
    expect(push).toHaveBeenCalledWith("/profile");
  });

  it("keeps a way off the notifications screen", () => {
    renderRoute(<Notifications />);

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(push).toHaveBeenCalledWith("/");
  });

  it("keeps a way off the profile screen", () => {
    renderRoute(<Profile />);

    fireEvent.click(screen.getByRole("button", { name: "Cart" }));
    expect(push).toHaveBeenCalledWith("/cart");
  });
});
