import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CartMenu from './CartMenu';
import { rootReducer } from '@/app/providers/store-provider/config/rootReducer';
import { selectedCartItems } from '@/entities/cart/model/cart.slice';
import { IProduct } from '@/entities/product';

/**
 * The cart's overflow menu, restored around the one thing it can honestly do.
 *
 * The version this replaces opened nothing at all. The bar it has to clear is
 * therefore: every route into it ends in a real state change, and when there is no
 * such state change available the button is not there.
 */

const product = (id: number, quantity: number): IProduct => ({
  id,
  src: `/images/products/${id}.png`,
  name: `Product ${id}`,
  unitValue: 1,
  unit: 'kg',
  price: 2.2,
  category: 'Fruits',
  category_id: 1,
  quantity,
});

const createStore = (items: IProduct[]) =>
  configureStore({
    reducer: rootReducer,
    preloadedState: { cart: { items, selectedProduct: null } },
  });

const renderMenu = (items: IProduct[]) => {
  const store = createStore(items);
  render(
    <Provider store={store}>
      <CartMenu />
    </Provider>
  );
  return store;
};

const openMenu = () => fireEvent.click(screen.getByTestId('dots'));

describe('CartMenu', () => {
  // An overflow menu whose only entry is dead is exactly the control that was removed.
  it('is not rendered at all when the cart is empty', () => {
    renderMenu([]);

    expect(screen.queryByTestId('dots')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cart-menu')).not.toBeInTheDocument();
  });

  it('appears once there is something to clear', () => {
    renderMenu([product(1, 1)]);

    expect(screen.getByTestId('dots')).toBeInTheDocument();
  });

  it('stays closed until it is asked to open', () => {
    renderMenu([product(1, 1)]);

    expect(screen.queryByTestId('cart-menu')).not.toBeInTheDocument();
    expect(screen.getByTestId('dots')).toHaveAttribute('aria-expanded', 'false');

    openMenu();

    expect(screen.getByTestId('cart-menu')).toBeInTheDocument();
    expect(screen.getByTestId('dots')).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes again when the trigger is pressed a second time', () => {
    renderMenu([product(1, 1)]);

    openMenu();
    openMenu();

    expect(screen.queryByTestId('cart-menu')).not.toBeInTheDocument();
  });

  describe('clearing the cart', () => {
    // Losing a whole basket to one mis-tap next to "Proceed to checkout" is not a risk
    // worth taking for a menu entry.
    it('asks before emptying anything', () => {
      const store = renderMenu([product(1, 2), product(2, 1)]);

      openMenu();
      fireEvent.click(screen.getByTestId('cart-menu-clear'));

      expect(screen.getByTestId('cart-menu-confirm')).toHaveTextContent('Remove 3 items');
      expect(selectedCartItems(store.getState())).toHaveLength(2);
    });

    it('counts the confirmation prompt off the real cart', () => {
      renderMenu([product(1, 1)]);

      openMenu();
      fireEvent.click(screen.getByTestId('cart-menu-clear'));

      expect(screen.getByTestId('cart-menu-confirm')).toHaveTextContent('Remove 1 item from the cart');
    });

    it('empties the cart when the action is confirmed', () => {
      const store = renderMenu([product(1, 2), product(2, 1)]);

      openMenu();
      fireEvent.click(screen.getByTestId('cart-menu-clear'));
      fireEvent.click(screen.getByTestId('cart-menu-clear-confirm'));

      expect(selectedCartItems(store.getState())).toHaveLength(0);
    });

    it('takes the whole control away once the cart is empty', () => {
      renderMenu([product(1, 1)]);

      openMenu();
      fireEvent.click(screen.getByTestId('cart-menu-clear'));
      fireEvent.click(screen.getByTestId('cart-menu-clear-confirm'));

      expect(screen.queryByTestId('cart-menu')).not.toBeInTheDocument();
      expect(screen.queryByTestId('dots')).not.toBeInTheDocument();
    });

    it('leaves the cart alone when the confirmation is cancelled', () => {
      const store = renderMenu([product(1, 2)]);

      openMenu();
      fireEvent.click(screen.getByTestId('cart-menu-clear'));
      fireEvent.click(screen.getByTestId('cart-menu-cancel'));

      expect(selectedCartItems(store.getState())).toHaveLength(1);
      expect(screen.queryByTestId('cart-menu')).not.toBeInTheDocument();
    });

    it('starts over rather than reopening on the confirmation step', () => {
      renderMenu([product(1, 2)]);

      openMenu();
      fireEvent.click(screen.getByTestId('cart-menu-clear'));
      fireEvent.click(screen.getByTestId('cart-menu-cancel'));
      openMenu();

      expect(screen.getByTestId('cart-menu-clear')).toBeInTheDocument();
      expect(screen.queryByTestId('cart-menu-confirm')).not.toBeInTheDocument();
    });
  });

  describe('dismissing', () => {
    it('closes on Escape', () => {
      renderMenu([product(1, 1)]);

      openMenu();
      fireEvent.keyDown(document, { key: 'Escape' });

      expect(screen.queryByTestId('cart-menu')).not.toBeInTheDocument();
    });

    it('abandons a pending confirmation on Escape', () => {
      const store = renderMenu([product(1, 1)]);

      openMenu();
      fireEvent.click(screen.getByTestId('cart-menu-clear'));
      fireEvent.keyDown(document, { key: 'Escape' });

      expect(screen.queryByTestId('cart-menu')).not.toBeInTheDocument();
      expect(selectedCartItems(store.getState())).toHaveLength(1);
    });

    it('closes when a press lands outside it', () => {
      renderMenu([product(1, 1)]);

      openMenu();
      fireEvent.mouseDown(document.body);

      expect(screen.queryByTestId('cart-menu')).not.toBeInTheDocument();
    });

    it('does not close on a press inside it', () => {
      renderMenu([product(1, 1)]);

      openMenu();
      fireEvent.mouseDown(screen.getByTestId('cart-menu'));

      expect(screen.getByTestId('cart-menu')).toBeInTheDocument();
    });
  });
});
