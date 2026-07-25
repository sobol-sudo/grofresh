import { render, screen, fireEvent } from "@testing-library/react";
import ProductCart from "./ProductCart";
import * as hooks from "@/app/providers/store-provider/config/hooks";
import { useCartQuantity } from "@/shared/hooks/useCartQuantity/useCartQuantity";
import { toggleCartItem } from "@/entities/cart/model/cart.slice";
import { IProduct } from "../../model/types";

// Mock useAppDispatch
jest.mock("@/app/providers/store-provider/config/hooks", () => ({
  useAppDispatch: jest.fn(),
}));

// Mock useCartQuantity
jest.mock("@/shared/hooks/useCartQuantity/useCartQuantity", () => ({
  useCartQuantity: jest.fn(),
}));

describe("ProductCart component", () => {
  const mockDispatch = jest.fn();
  const handleQuantityChangeMock = jest.fn();

  const product: IProduct = {
    id: 1,
    name: "Apple",
    price: 10,
    src: "/apple.png",
    unitValue: 1,
    unit: "kg" as const,
    quantity: 2,
    category: "Fruits",
    category_id: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (hooks.useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useCartQuantity as jest.Mock).mockReturnValue({
      handleQuantityChange: handleQuantityChangeMock,
    });
  });

  it("renders product info correctly", () => {
    render(<ProductCart product={product} />);
    
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("1 kg")).toBeInTheDocument();
    expect(screen.getByText("$10")).toBeInTheDocument();
    
    expect(screen.getByTestId("btn-increment")).toBeInTheDocument();
    expect(screen.getByTestId("btn-decrease")).toBeInTheDocument();
    expect(screen.getByTestId("counter-quantity")).toHaveTextContent("2");
  });

  it("calls removeProduct when clicking delete icon", () => {
    render(<ProductCart product={product} />);
    
    const deleteIcon = screen.getByTestId("delete-icon");
    fireEvent.click(deleteIcon);

    expect(mockDispatch).toHaveBeenCalledWith(toggleCartItem(product));
  });

  it("calls handleQuantityChange when Counter triggers change", () => {
    render(<ProductCart product={product} />);
    
    const incrementBtn = screen.getByTestId("btn-increment");
    fireEvent.click(incrementBtn);
    expect(handleQuantityChangeMock).toHaveBeenCalledWith(product, "increment");

    const decrementBtn = screen.getByTestId("btn-decrease");
    fireEvent.click(decrementBtn);
    expect(handleQuantityChangeMock).toHaveBeenCalledWith(product, "decrease");
  });
});
