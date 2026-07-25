import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useRouter } from "next/router";
import Categories from "@/pages/categories";
import Products from "@/pages/products";
import { rootReducer } from "@/app/providers/store-provider/config/rootReducer";
import { MOCK_PRODUCTS } from "@/entities/product/config/mock";
import { MOCK_CATEGORIES } from "@/widgets/browse-category/config/mock";
import { headerConfig } from "@/widgets/header/config";

/**
 * The two screens restored behind the home page's "See all" links, rendered as routes
 * against the real store, the real catalog and the real card components.
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

const renderRoute = (ui: React.ReactElement) =>
  render(<Provider store={configureStore({ reducer: rootReducer })}>{ui}</Provider>);

describe("/categories route", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  // The destination is a real screen, not a placeholder
  it("renders every category with a product count", () => {
    renderRoute(<Categories />);

    expect(screen.getAllByTestId("category-card")).toHaveLength(MOCK_CATEGORIES.length);
    expect(screen.getAllByTestId("category-count")).toHaveLength(MOCK_CATEGORIES.length);

    MOCK_CATEGORIES.forEach((category) => {
      expect(screen.getByText(category.name)).toBeInTheDocument();
    });
  });

  // The whole point of the screen: it leads into the catalog that already exists
  it("sends a tapped category into the ?category= catalog", () => {
    renderRoute(<Categories />);

    fireEvent.click(screen.getAllByTestId("category-card")[0]);

    expect(push).toHaveBeenCalledWith({
      pathname: "/",
      query: { category: MOCK_CATEGORIES[0].id },
    });
  });

  // Every count on the screen is one a real category filter would return
  it("prints counts the catalog actually backs", () => {
    renderRoute(<Categories />);

    const counts = screen
      .getAllByTestId("category-count")
      .map((node) => Number(node.textContent?.split(" ")[0]));

    counts.forEach((count, index) => {
      const matching = MOCK_PRODUCTS.filter(
        (product) => product.category_id === MOCK_CATEGORIES[index].id
      );
      expect(count).toBe(matching.length);
      expect(count).toBeGreaterThan(0);
    });
  });

  it("has a header entry so the route is titled and can be left", () => {
    expect(headerConfig["/categories"]).toEqual({
      backRoute: true,
      centerName: true,
      title: "Categories",
      cartIcon: true,
    });
  });
});

describe("/products route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
  });

  // The home page holds products back; this screen is where the rest of them are
  it("renders the entire catalog", () => {
    renderRoute(<Products />);

    expect(screen.getAllByTestId("product-wrapper")).toHaveLength(MOCK_PRODUCTS.length);
    MOCK_PRODUCTS.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });
  });

  it("states a count matching the cards on screen", () => {
    renderRoute(<Products />);

    const rendered = screen.getAllByTestId("product-wrapper").length;
    expect(screen.getByTestId("catalog-count")).toHaveTextContent(`${rendered} products`);
  });

  it("has a header entry so the route is titled and can be left", () => {
    expect(headerConfig["/products"]).toEqual({
      backRoute: true,
      centerName: true,
      title: "All products",
      cartIcon: true,
    });
  });
});
