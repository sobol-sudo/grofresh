import { cartReducer, toggleCartItem, incrementItem, decrementOrRemoveItem, clearLastProduct, selectedCartQuantity, selectedCartItems, selectedProduct, ProductState, toggleSelectedProduct, selectedCartCount, allPriceCart } from './cart.slice';
import { IProduct } from '@/entities/product';

// Mock products used across the tests
const mockProduct: IProduct = {
  id: 1,
  name: 'Spinach',
  unitValue: 1,
  unit: 'kg',
  price: 10.5,
  src: '/images/products/spinach.png',
  category: '',
  category_id: 1,
  quantity: 1
};

const anotherProduct: IProduct = {
  id: 2,
  name: 'Tomato',
  unitValue: 1,
  unit: 'kg',
  price: 5.21,
  src: '/images/products/tomato.png',
  category: '',
  category_id: 2,
  quantity: 1
};

describe('cartSlice reducers', () => {

  // Adds a new product to the cart and sets selectedProduct
  test('toggleCartItem adds a new item with quantity 1 and sets selectedProduct', () => {
    const state = cartReducer(undefined, toggleCartItem(mockProduct));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(1);
    expect(state.selectedProduct?.id).toBe(mockProduct.id);
  });

  // Removes a product from the cart when it is already selected
  test('toggleCartItem removes item from cart when it is already selected', () => {
    const initialState: ProductState = {
      items: [
        { ...mockProduct, quantity: 2 },
        { ...anotherProduct, quantity: 1 }
      ],
      selectedProduct: { ...mockProduct, quantity: 2 }
    };

    const state = cartReducer(initialState, toggleCartItem(mockProduct));

    expect(state.items.find(i => i.id === mockProduct.id)).toBeUndefined();
    expect(state.items.find(i => i.id === anotherProduct.id)).toBeDefined();
    expect(state.selectedProduct).toBeNull();
  });

  // Toggling a second time removes the product and leaves no trace in the list
  test('toggleCartItem existing item not selected sets selectedProduct to quantity 0', () => {
    const initialState: ProductState = {
      items: [
        { ...mockProduct, quantity: 2 },
        { ...anotherProduct, quantity: 1 }
      ],
      selectedProduct: null
    };

    const state = cartReducer(initialState, toggleCartItem(mockProduct));

    const remainingIds = state.items.map(item => item.id);
    expect(remainingIds).not.toContain(mockProduct.id);
    expect(remainingIds).toContain(anotherProduct.id);

    expect(state.selectedProduct).toEqual({ ...mockProduct, quantity: 0 });

    expect(state.items).toHaveLength(1);
  });

  // Adding the same product twice toggles it back off
  test('toggleCartItem removes item if it already exists', () => {
    let state = cartReducer(undefined, toggleCartItem(mockProduct));
    state = cartReducer(state, toggleCartItem(mockProduct)); // toggle remove
    expect(state.items).toHaveLength(0);
    expect(state.selectedProduct).toBeNull();
  });

  // Increments a product's quantity
  test('incrementItem increases quantity of existing item', () => {
    let state = cartReducer(undefined, toggleCartItem(mockProduct));
    state = cartReducer(state, incrementItem(mockProduct));
    expect(state.items[0].quantity).toBe(2);
    expect(state.selectedProduct?.id).toBe(mockProduct.id);
  });

  // Increments quantity correctly when it is already greater than 1
  test('incrementItem increases quantity correctly when quantity > 1', () => {
    const initialState: ProductState = {
      items: [{ ...mockProduct, quantity: 2 }],
      selectedProduct: null
    };
    const state = cartReducer(initialState, incrementItem(mockProduct));
    expect(state.items[0].quantity).toBe(3);
  });

  // Increments quantity correctly when it is 0 and the product is not in the cart
  test('incrementItem adds new product with quantity 1 if not in cart', () => {
    const initialState: ProductState = {
      items: [],
      selectedProduct: mockProduct
    };
    const state = cartReducer(initialState, incrementItem(mockProduct));
    expect(state.items[0].quantity).toBe(1);
  });

  // Incrementing one product's quantity leaves the other cart items untouched
  test('incrementItem does not change other items', () => {
    const initialState: ProductState = {
      items: [
        { ...mockProduct, quantity: 1 },
        { ...anotherProduct, quantity: 3 }
      ],
      selectedProduct: null
    };
    const state = cartReducer(initialState, incrementItem(mockProduct));
    expect(state.items.find(i => i.id === mockProduct.id)?.quantity).toBe(2);
    expect(state.items.find(i => i.id === anotherProduct.id)?.quantity).toBe(3);
  });

  // Decrements quantity and removes the product once it reaches 0
  test('decrementOrRemoveItem decreases quantity and removes item when quantity reaches 0', () => {
    let state = cartReducer(undefined, toggleCartItem(mockProduct)); // quantity 1
    state = cartReducer(state, incrementItem(mockProduct)); // quantity 2
    state = cartReducer(state, decrementOrRemoveItem(mockProduct)); // quantity 1
    expect(state.items[0].quantity).toBe(1);
    expect(state.selectedProduct?.id).toBe(mockProduct.id);

    state = cartReducer(state, decrementOrRemoveItem(mockProduct)); // remove completely
    expect(state.items).toHaveLength(0);
    expect(state.selectedProduct).toBeNull();
  });


  // decrementOrRemoveItem is a no-op when the product is not in the cart
  test('decrementOrRemoveItem does not change the shopping cart if the current product is not found.', () => {
    // Add mockProduct to the cart
    let state = cartReducer(undefined, toggleCartItem(mockProduct));
    // Keep a copy of the original state to compare against
    const initialItems = [...state.items];

    // Try to decrement/remove anotherProduct, which is not in the cart
    state = cartReducer(state, decrementOrRemoveItem(anotherProduct));

    // The cart length is unchanged
    expect(state.items).toHaveLength(initialItems.length);

    // The cart contents are unchanged
    expect(state.items).toEqual(initialItems);

    // And the item still in the cart is exactly mockProduct
    expect(state.items[0]).toEqual(mockProduct);
  });

  // Tests for toggleSelectedProduct
  describe('toggleSelectedProduct', () => {

    // Sets selectedProduct when nothing is selected yet
    test('sets selectedProduct if none is selected', () => {
      const initialState: ProductState = { items: [], selectedProduct: null };
      const state = cartReducer(initialState, toggleSelectedProduct(mockProduct));
      expect(state.selectedProduct).toEqual(mockProduct);
    });

    // Switches the selection to a different product
    test('sets selectedProduct to new product if different is selected', () => {
      const initialState: ProductState = { items: [], selectedProduct: mockProduct };
      const state = cartReducer(initialState, toggleSelectedProduct(anotherProduct));
      expect(state.selectedProduct).toEqual(anotherProduct);
    });

    // Clears selectedProduct when the same product is selected again
    test('resets selectedProduct to null if same product is toggled', () => {
      const initialState: ProductState = { items: [], selectedProduct: mockProduct };
      const state = cartReducer(initialState, toggleSelectedProduct(mockProduct));
      expect(state.selectedProduct).toBeNull();
    });
  });

  // Removing one product does not affect the others
  test('decrementOrRemoveItem does not affect other items', () => {
    let state = cartReducer(undefined, toggleCartItem(mockProduct));
    state = cartReducer(state, toggleCartItem(anotherProduct));
    state = cartReducer(state, decrementOrRemoveItem(mockProduct));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe(anotherProduct.id);
  });

  // clearLastProduct resets selectedProduct
  test('clearLastProduct sets selectedProduct to null', () => {
    let state = cartReducer(undefined, toggleCartItem(mockProduct));
    state = cartReducer(state, clearLastProduct());
    expect(state.selectedProduct).toBeNull();
  });
});

// Tests for the selectors
describe('cartSlice selectors', () => {

  // Returns every item in the cart
  test('selectedCartItems returns all items', () => {
    const state: { cart: ProductState } = { cart: { items: [], selectedProduct: null } };
    state.cart = cartReducer(state.cart, toggleCartItem(mockProduct));
    state.cart = cartReducer(state.cart, toggleCartItem(anotherProduct));
    const items = selectedCartItems(state);
    expect(items).toHaveLength(2);
    expect(items.map(i => i.id)).toEqual([mockProduct.id, anotherProduct.id]);
  });

  // Returns the most recently selected product
  test('selectedProduct returns last modified product', () => {
    const state: { cart: ProductState } = { cart: { items: [], selectedProduct: null } };
    state.cart = cartReducer(state.cart, toggleCartItem(mockProduct));
    expect(selectedProduct(state)?.id).toBe(mockProduct.id);

    state.cart = cartReducer(state.cart, toggleCartItem(anotherProduct));
    expect(selectedProduct(state)?.id).toBe(anotherProduct.id);
  });

  // Sums the quantities correctly
  test('selectedCartQuantity sums quantities correctly', () => {
    const state = {
      cart: {
        items: [
          { ...mockProduct, quantity: 2 },
          { ...anotherProduct, quantity: 3 }
        ],
        selectedProduct: null
      }
    };
    expect(selectedCartQuantity(state)).toBe(5);
  });

  // Behaviour with an empty cart
  test('selectedCartQuantity returns 0 for empty cart', () => {
    const state = { cart: { items: [], selectedProduct: null } };
    expect(selectedCartQuantity(state)).toBe(0);
  });

  // Counts the distinct products in the cart
  test('selectedCartCount returns the correct number of unique items', () => {
    const state = { cart: { items: [], selectedProduct: null } };

    expect(selectedCartCount(state)).toBe(0);

    const state2 = { cart: { items: [mockProduct, anotherProduct], selectedProduct: null } };

    expect(selectedCartCount(state2)).toBe(2);
  });

  // allPriceCart returns the correct total price for every item in the cart (quantities included)
  test('allPriceCart returns the correct prices of all products (and their total quantity) in the shopping cart', () => {
    const state = { cart: { items: [{ ...mockProduct, price: 2.51 }, { ...anotherProduct, price: 2.52 }], selectedProduct: null } };

    expect(allPriceCart(state)).toBe('5.03')

    const state2 = { cart: { items: [{ ...mockProduct, price: 2.51 }, { ...anotherProduct, price: 2.52, quantity: 2 }], selectedProduct: null } };

    expect(allPriceCart(state2)).toBe('7.55')
  })
});
