import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useRouter } from "next/router";
import Home from "@/pages/index";
import { rootReducer } from "@/app/providers/store-provider/config/rootReducer";
import { MOCK_PRODUCTS } from "@/entities/product/config/mock";
import { MOCK_CATEGORIES } from "@/widgets/browse-category/config/mock";
import { POPULAR_LIMIT } from "@/widgets/popular-now/PopularNow";

/**
 * The home page as it is actually assembled, checking that both restored links are
 * reachable from it and point at routes that exist.
 *
 * This file lives outside src/pages because anything under pages/ is treated as a route.
 */

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const renderHome = (query: Record<string, string> = {}) => {
  (useRouter as jest.Mock).mockReturnValue({
    query,
    push: jest.fn(),
    replace: jest.fn(),
  });

  return render(
    <Provider store={configureStore({ reducer: rootReducer })}>
      <Home />
    </Provider>
  );
};

describe("home page 'See all' links", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("links the category strip to /categories", () => {
    renderHome();

    expect(screen.getByRole("link", { name: "See all categories" }))
      .toHaveAttribute("href", "/categories");
  });

  it("links the popular teaser to /products", () => {
    renderHome();

    expect(screen.getByRole("link", { name: "See all products" }))
      .toHaveAttribute("href", "/products");
  });

  // Both read "See all" on screen; a screen reader still hears which is which
  it("gives the two links distinct accessible names", () => {
    renderHome();

    const labels = screen
      .getAllByText("See all")
      .map((link) => link.getAttribute("aria-label"));

    expect(labels).toEqual(["See all categories", "See all products"]);
    expect(new Set(labels).size).toBe(labels.length);
  });

  // The teaser has to actually hold something back, or "See all" leads nowhere new
  it("shows fewer products than the catalog holds", () => {
    renderHome();

    const shown = screen.getAllByTestId("product-wrapper").length;
    expect(shown).toBe(POPULAR_LIMIT);
    expect(shown).toBeLessThan(MOCK_PRODUCTS.length);
  });

  // The strip shows every category, so its link is about laying them out, not hiding them
  it("keeps the whole category strip on the home page", () => {
    renderHome();

    expect(screen.getAllByTestId("category-card")).toHaveLength(MOCK_CATEGORIES.length);
  });

  // Filtering replaces the teaser with results, and the teaser link goes with it
  it("swaps the products link for Clear once a filter is active", () => {
    renderHome({ category: String(MOCK_CATEGORIES[0].id) });

    expect(screen.getByRole("link", { name: "See all categories" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "See all products" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
    expect(screen.getByText("Results")).toBeInTheDocument();
  });
});
