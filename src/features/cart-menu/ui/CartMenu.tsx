import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/providers/store-provider/config/hooks';
import { clearCart, selectedCartQuantity } from '@/entities/cart/model/cart.slice';
import { useClickOutside } from '@/shared/hooks/useClickOutside/useClickOutside';
import { pluralize } from '@/shared/lib/pluralize';
import IconButton from '@/shared/ui/IconButton';

/**
 * The cart's overflow menu.
 *
 * It holds one action, because emptying the cart is the only thing the cart can
 * currently do that is not already a button on the screen. A menu is still the right
 * home for it: clearing is destructive, and destructive actions do not belong next to
 * "Proceed to checkout" where a mis-tap costs you the whole basket.
 *
 * With an empty cart there is nothing to clear, so the button is not rendered at all
 * rather than opening onto a disabled row. A control that can never do anything is
 * what this app already had to strip out once.
 */
export default function CartMenu() {
  const dispatch = useAppDispatch();
  const itemCount = useAppSelector(selectedCartQuantity);

  const [isOpen, setOpen] = useState(false);
  const [isConfirming, setConfirming] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setConfirming(false);
  }, []);

  // The ref covers the trigger as well as the panel, so opening the menu is not itself
  // an outside click.
  useClickOutside(menuRef as React.RefObject<HTMLElement>, close);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [close]);

  const handleClear = () => {
    dispatch(clearCart());
    close();
  };

  if (itemCount === 0) return null;

  return (
    <div className="relative" ref={menuRef}>
      <IconButton
        sx={{ width: 50, height: 50 }}
        data-testid="dots"
        aria-label="Cart options"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setOpen((open) => !open)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M11.827 16.5107C12.1148 16.5108 12.3911 16.6256 12.5946 16.8291C12.7978 17.0325 12.9119 17.3082 12.912 17.5957C12.912 17.8834 12.798 18.1598 12.5946 18.3633C12.3911 18.5668 12.1148 18.6816 11.827 18.6816C11.5392 18.6816 11.2629 18.5668 11.0594 18.3633C10.856 18.1598 10.742 17.8835 10.742 17.5957C10.7421 17.3081 10.8562 17.0325 11.0594 16.8291C11.2629 16.6256 11.5392 16.5107 11.827 16.5107ZM11.827 10.7412C12.1148 10.7412 12.3911 10.8561 12.5946 11.0596C12.7979 11.2631 12.912 11.5395 12.912 11.8271C12.9119 12.1147 12.7978 12.3904 12.5946 12.5938C12.3911 12.7972 12.1148 12.9121 11.827 12.9121C11.5392 12.9121 11.2629 12.7973 11.0594 12.5938C10.8562 12.3904 10.7421 12.1147 10.742 11.8271C10.742 11.5394 10.856 11.2631 11.0594 11.0596C11.2629 10.8561 11.5392 10.7412 11.827 10.7412ZM11.827 4.97266C12.1148 4.97268 12.3911 5.08655 12.5946 5.29004C12.798 5.49354 12.912 5.76985 12.912 6.05762C12.9119 6.34539 12.7981 6.62171 12.5946 6.8252C12.3911 7.02869 12.1148 7.14256 11.827 7.14258C11.5392 7.14258 11.2629 7.02866 11.0594 6.8252C10.8559 6.62171 10.7421 6.34539 10.742 6.05762C10.742 5.76981 10.8559 5.49355 11.0594 5.29004C11.2629 5.08653 11.5392 4.97266 11.827 4.97266Z" fill="black" stroke="black" strokeWidth="0.714286" />
        </svg>
      </IconButton>

      {isOpen && (
        <div
          role="menu"
          data-testid="cart-menu"
          className="absolute right-0 top-[56px] z-1000 w-[240px] rounded-2xl bg-white shadow p-2.5"
        >
          {isConfirming ? (
            <div className="flex flex-col gap-2.5" data-testid="cart-menu-confirm">
              <p className="h6-regular p-[5px]">
                Remove {pluralize(itemCount, 'item')} from the cart? This cannot be undone.
              </p>

              {/*
                The fill and the padding live on the inner span: the global reset
                zeroes `background` and `padding` on every `button` from outside a
                cascade layer, so the same utilities on the button would be dropped.
              */}
              <div className="flex gap-2.5">
                <button
                  type="button"
                  className="flex-1 basis-0 cursor-pointer"
                  data-testid="cart-menu-cancel"
                  onClick={close}
                >
                  <span className="block h6-bold text-center rounded-xl bg-[var(--color-flash-white)] py-2.5">
                    Cancel
                  </span>
                </button>

                <button
                  type="button"
                  className="flex-1 basis-0 cursor-pointer"
                  data-testid="cart-menu-clear-confirm"
                  onClick={handleClear}
                >
                  <span className="block h6-bold text-center rounded-xl bg-[var(--color-orange-500)] text-white py-2.5">
                    Clear cart
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              role="menuitem"
              className="w-full cursor-pointer"
              data-testid="cart-menu-clear"
              onClick={() => setConfirming(true)}
            >
              <span className="block text-left h5-regular rounded-xl px-[10px] py-[12px] hover:bg-[var(--color-flash-white)]">
                Clear cart
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
