import { Category } from "../model/types";

// Every category here has products in MOCK_PRODUCTS: selecting one always returns a result.
export const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: "Vegetables",
    image: "/images/categories/vegetables.png",
  },
  {
    id: 2,
    name: "Meat",
    image: "/images/categories/meat.png",
  },
  {
    id: 3,
    name: "Bakery",
    image: "/images/categories/bakery.png",
  },
  {
    id: 4,
    name: "Dairy",
    image: "/images/categories/dairy.png",
  },
  {
    id: 5,
    name: "Fruits",
    image: "/images/categories/fruits.png",
  },
];
