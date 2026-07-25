import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useRouter } from "next/router";
import Home from "@/pages/index";
import Deals from "@/pages/deals";
import { rootReducer } from "@/app/providers/store-provider/config/rootReducer";
import { headerConfig } from "@/widgets/header/config";
import { MOCK_PRODUCTS } from "@/entities/product/config/mock";
import {
  discountedPrice,
  formatPrice,
  hasDiscount,
  selectDiscountedProducts,
  selectMaxDiscountPercent,
} from "@/entities/product";
import { allPriceCart, toggleCartItem } from "@/entities/cart/model/cart.slice";

/**
 * The "Fresh Deals" banner and the screen behind it, against the real catalog.
 *
 * The banner is the app's oldest broken promise: it advertised a percentage off behind
 * a button that opened nothing, and no price anywhere in the app reflected the sale.
 * These tests hold both halves closed — the link lands on a real, titled route, and
 * the price it advertises is the price the cart charges. This file lives outside
 * src/pages because anything under pages/ is treated as a route.
 */

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const dealsInCatalog = selectDiscountedProducts(MOCK_PRODUCTS);

const renderRoute = (ui: React.ReactElement, query: Record<string, string> = {}) => {
  (useRouter as jest.Mock).mockReturnValue({
    query,
    push: jest.fn(),
    replace: jest.fn(),
  });

  return render(
    <Provider store={configureStore({ reducer: rootReducer })}>{ui}</Provider>
  );
};

describe("the deals promise", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // The premise of every test below: the repo really is running a promotion
  it("has products on offer to talk about", () => {
    expect(dealsInCatalog.length).toBeGreaterThan(0);
    expect(dealsInCatalog.length).toBeLessThan(MOCK_PRODUCTS.length);
    expect(selectMaxDiscountPercent(MOCK_PRODUCTS)).toBeGreaterThan(0);
  });

  // The banner is a way in, not just an advertisement
  it("links the home banner to /deals", () => {
    renderRoute(<Home />);

    expect(screen.getByTestId("explore-deals")).toHaveAttribute("href", "/deals");
  });

  // A link into a route with no header entry lands on an untitled, unleavable screen
  it("registers /deals in the header config", () => {
    expect(headerConfig).toHaveProperty("/deals");
    expect(headerConfig["/deals"].title).toBe("Fresh Deals");
    expect(headerConfig["/deals"].backRoute).toBe(true);
  });

  // The destination shows the products the banner counted, and only those
  it("renders exactly the discounted products", () => {
    renderRoute(<Deals />);

    expect(screen.getAllByTestId("product-wrapper")).toHaveLength(dealsInCatalog.length);

    dealsInCatalog.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });
  });

  // Nothing full-price sneaks onto a screen headed "Fresh Deals"
  it("keeps full-price products off the deals screen", () => {
    renderRoute(<Deals />);

    MOCK_PRODUCTS.filter((product) => !hasDiscount(product)).forEach((product) => {
      expect(screen.queryByText(product.name)).not.toBeInTheDocument();
    });
  });

  // The printed count is the length of the list beside it
  it("counts the products it renders", () => {
    renderRoute(<Deals />);

    const rendered = screen.getAllByTestId("product-wrapper").length;
    expect(screen.getByTestId("deals-count")).toHaveTextContent(`${rendered} products on offer`);
  });

  // The headline percent is the catalog's, and the banner states the same one
  it("agrees with the banner about the size of the sale", () => {
    const percent = selectMaxDiscountPercent(MOCK_PRODUCTS);

    renderRoute(<Home />);
    expect(screen.getByText(new RegExp(`Today ${percent}% OFF`, "i"))).toBeInTheDocument();

    renderRoute(<Deals />);
    expect(screen.getByTestId("deals-headline")).toHaveTextContent(`Up to ${percent}% off`);
  });

  // Every price on the screen is the discounted one, computed the one agreed way
  it("prices every card at its discount", () => {
    renderRoute(<Deals />);

    const shown = screen.getAllByTestId("product-price").map((node) => node.textContent);
    const expected = dealsInCatalog.map((product) => `$${formatPrice(discountedPrice(product))}`);

    expect(shown).toEqual(expected);
  });

  // A struck-through price that equalled the price charged would be a fake saving
  it("strikes through a list price that is genuinely higher", () => {
    renderRoute(<Deals />);

    const listPrices = screen.getAllByTestId("product-list-price").map((node) => node.textContent);

    expect(listPrices).toHaveLength(dealsInCatalog.length);

    dealsInCatalog.forEach((product, index) => {
      expect(listPrices[index]).toBe(`$${formatPrice(product.price)}`);
      expect(discountedPrice(product)).toBeLessThan(product.price);
    });
  });

  /*
    The one that matters: what the customer is shown is what the customer is charged.
    A discount rendered on the card but ignored by the total would be a worse lie than
    the banner that started all this.
  */
  it("charges the price it advertises", () => {
    const store = configureStore({ reducer: rootReducer });
    const promoted = dealsInCatalog[0];

    store.dispatch(toggleCartItem(promoted));

    expect(allPriceCart(store.getState())).toBe(formatPrice(discountedPrice(promoted)));
    expect(Number(allPriceCart(store.getState()))).toBeLessThan(promoted.price);
  });
});
