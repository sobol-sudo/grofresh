import { render, screen, fireEvent } from "@testing-library/react";
import CartItemsList from "./CartItemsList";
import * as hooks from "@/app/providers/store-provider/config/hooks";
import { IProduct } from "@/entities/product";

jest.mock("@/app/providers/store-provider/config/hooks", () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

jest.mock("@/entities/product", () => ({
  ProductCart: ({ product }: { product: IProduct }) => <div>{product.name}</div>,
}));

describe("CartItemsList component", () => {
  const mockUseAppSelector = hooks.useAppSelector as jest.Mock;
  const mockUseAppDispatch = hooks.useAppDispatch as jest.Mock;

  const items: IProduct[] = [
    { id: 1, name: "Apple", price: 10, src: "/apple.png", unitValue: 1, unit: "kg", quantity: 2, category: "Fruits", category_id: 1 },
    { id: 2, name: "Banana", price: 5, src: "/banana.png", unitValue: 1, unit: "kg", quantity: 1, category: "Fruits", category_id: 1 },
    { id: 3, name: "Orange", price: 8, src: "/orange.png", unitValue: 1, unit: "kg", quantity: 3, category: "Fruits", category_id: 1 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppDispatch.mockReturnValue(jest.fn());
  });

  // Renders the empty-cart state
  it("renders empty cart message when no items", () => {
    mockUseAppSelector.mockReturnValue(0);
    render(<CartItemsList items={[]} showDefaultItems={2} />);

    expect(screen.getByAltText("Empty cart")).toBeInTheDocument();
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });

  // Renders only the first slice of items
  it("renders only default items if items.length > showDefaultItems", () => {
    mockUseAppSelector.mockReturnValue(items.length);
    render(<CartItemsList items={items} showDefaultItems={2} />);

    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.queryByText("Orange")).not.toBeInTheDocument();
    expect(screen.getByText("Show 1 more")).toBeInTheDocument();
  });

  // Shows every item after clicking "Show more"
  it("shows all items when clicking 'Show more' and toggles to 'Less items'", () => {
    mockUseAppSelector.mockReturnValue(items.length);
    render(<CartItemsList items={items} showDefaultItems={2} />);

    const toggleButton = screen.getByText(/Show 1 more/i);
    fireEvent.click(toggleButton);

    expect(screen.getByText("Orange")).toBeInTheDocument();
    expect(screen.getByText("Less items")).toBeInTheDocument();

    // Click again to collapse the list
    fireEvent.click(screen.getByText("Less items"));
    expect(screen.queryByText("Orange")).not.toBeInTheDocument();
    expect(screen.getByText("Show 1 more")).toBeInTheDocument();
  });

  // The "Show more" toggle is hidden when items.length <= showDefaultItems
  it("does not render toggle button if items.length <= showDefaultItems", () => {
    mockUseAppSelector.mockReturnValue(2);
    render(<CartItemsList items={items.slice(0, 2)} showDefaultItems={2} />);

    expect(screen.queryByText(/Show/i)).not.toBeInTheDocument();
  });
});
