import { useAppDispatch, useAppSelector } from '@/app/providers/store-provider/config/hooks'
import { clearLastProduct } from '@/entities/cart/model/cart.slice';
import { discountedPrice, formatPrice, hasDiscount } from '@/entities/product';
import { useCartQuantity } from '@/shared/hooks/useCartQuantity/useCartQuantity';
import { useClickOutside } from '@/shared/hooks/useClickOutside/useClickOutside';
import Button from '@/shared/ui/Button';
import Counter from '@/shared/ui/Counter';
import IconButton from '@/shared/ui/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function AddToCartModal() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { handleQuantityChange } = useCartQuantity();

  const modalRef = useRef<HTMLDivElement>(null)

  const currentItem = useAppSelector((state) => {
    const selected = state.cart.selectedProduct
    if (!selected) return null
    return state.cart.items.find(item => item.id === selected.id) || selected
  })

  const handleCartAction = () => {
    if (!currentItem) return;

    if (currentItem.quantity > 0) {
      router.push('/cart');
    } else {
      handleQuantityChange(currentItem, 'increment');
    }
  };

  const handleBuyNow = () => {
    if (!currentItem) return;

    if (currentItem.quantity === 0) {
      handleQuantityChange(currentItem, 'increment');
    }

    router.push({
      pathname: '/cart',
      query: { checkout: 'true' },
    });
  };

  useEffect(() => {
    dispatch(clearLastProduct());
  }, [pathname, dispatch]);

  const closeModal = useCallback(() => {
    dispatch(clearLastProduct());
  }, [dispatch]);

  // A single click or tap outside is the expected way to dismiss a sheet like this.
  useClickOutside(modalRef as React.RefObject<HTMLElement>, closeModal)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeModal]);

  useEffect(() => {
    if (!modalRef.current) return;

    if (currentItem?.id && pathname === '/') {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    } else {
      gsap.to(modalRef.current, { opacity: 0, y: 50, duration: 0.3, ease: 'power2.in' });
    }
  }, [currentItem?.id, pathname]);

  if (!currentItem || pathname !== '/') return null;
  return (
    <div
      ref={modalRef}
      className="fixed bottom-0 left-1/2 translate-x-[-50%] w-full max-w-md bg-white rounded-t-2xl p-6 z-1000 will-change-transform will-change-opacity"
    >
      <div className='flex justify-end -mt-3 -mr-2'>
        <IconButton size='small' aria-label='Close' onClick={closeModal}>
          <CloseIcon fontSize='small' sx={{ color: 'black' }} />
        </IconButton>
      </div>

      <div className='flex justify-between items-center'>
        <div className='flex flex-col gap-[5px]'>
          <span className='flex items-baseline gap-2'>
            <p className='h3-bold'>${formatPrice(discountedPrice(currentItem))}</p>

            {hasDiscount(currentItem) && (
              <s className='h6-regular text-gray-500' data-testid='modal-list-price'>
                ${formatPrice(currentItem.price)}
              </s>
            )}
          </span>
          <span className='h6-regular'>{currentItem.name}</span>
        </div>

        {typeof currentItem.quantity === 'number' && (
          <Counter quantity={currentItem.quantity} handleChange={(type) => handleQuantityChange(currentItem, type)} />
        )}
      </div>

      <div className='flex justify-between items-center gap-2.5 mt-[19px]'>
        <Button
          sx={{
            height: 50,
            borderRadius: 50,
            width: '100%',
            textTransform: 'none',
          }}
          onClick={handleCartAction}
        >
          <span className='text-black h5-bold'>
            {currentItem.quantity ? 'Go to cart' : 'Add to cart'}
          </span>
        </Button>

        <Button
          colorType='success'
          sx={{
            height: 50,
            borderRadius: 50,
            width: '100%',
            textTransform: 'none',

          }}
          onClick={handleBuyNow}
        >
          <span className='text-white h5-bold'>Buy now</span>
        </Button>
      </div>
    </div>
  );
}