import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAppSelector } from '@/app/providers/store-provider/config/hooks';
import { selectOrders, selectOrdersHydrated, type Order } from '@/entities/order';
import { discountedPrice, formatPrice, type IProduct } from '@/entities/product';
import { BottomNavBar } from '@/features/bottom-nav-bar';
import Button from '@/shared/ui/Button';
import { pluralize } from '@/shared/lib/pluralize';

/** Quantities, not distinct products: two bananas are two items, the same way the receipt counts them. */
const countItems = (order: Order) =>
  order.items.reduce((total, item) => total + item.quantity, 0);

/**
 * One purchased product inside a past order.
 *
 * Deliberately not `ProductCart`, which looks right and would be wrong: its counter and
 * its close icon both dispatch cart actions, so the delete cross on a two-month-old
 * receipt would quietly *add* that product to the live cart. History is a record of what
 * happened, so these rows carry no controls at all — only the shared price helpers, so a
 * line reads back exactly what was charged for it.
 */
function OrderLine({ item }: { item: IProduct }) {
  return (
    <li className="flex items-center gap-2.5" data-testid="order-line">
      <div className="bg-flash-white rounded-[15px] shrink-0 p-2">
        <Image src={item.src} width={40} height={40} alt={item.name} />
      </div>

      <div className="flex flex-col gap-[3px] w-full">
        <span className="h6-bold">{item.name}</span>
        <span className="small-regular text-gray-500">
          {item.unitValue} {item.unit} {'·'} {item.quantity} {'×'} ${formatPrice(discountedPrice(item))}
        </span>
      </div>

      <span className="h6-regular shrink-0" data-testid="order-line-total">
        ${formatPrice(discountedPrice(item) * item.quantity)}
      </span>
    </li>
  );
}

/**
 * Every order placed on this device, newest first.
 *
 * The list is the persisted history, which the slice already keeps in newest-first order
 * and caps, so this screen sorts nothing and invents nothing: an order appears here
 * because checkout really put it there. Line prices go through the same
 * `discountedPrice` the cart charged with, so a receipt cannot read back a different
 * number than the one that was paid.
 */
export default function OrderHistory() {
  const router = useRouter();

  const orders = useAppSelector(selectOrders);
  const isHydrated = useAppSelector(selectOrdersHydrated);

  /*
    Storage is read in an effect after mount, so on a cold load this screen renders once
    before the history exists. Showing the empty state in that frame would tell someone
    with twenty orders that they have never bought anything, then correct itself — so the
    un-read state is its own state rather than a guess at the empty one.
  */
  if (!isHydrated) {
    return (
      <div className="flex flex-col pb-[33px]">
        <p className="small-regular text-gray-500" data-testid="orders-loading">
          Loading your orders
        </p>
        <BottomNavBar className="mt-2.5" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col pb-[33px]">
        <div className="flex flex-col items-center text-center mt-[40px]" data-testid="orders-empty">
          <div className="flex items-center justify-center w-[90px] h-[90px] rounded-full bg-[var(--color-flash-white)]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M6 7h12l-1 13.5H7L6 7Z"
                stroke="#00824B"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path
                d="M9.25 9V6.5a2.75 2.75 0 0 1 5.5 0V9"
                stroke="#00824B"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h4 className="h4-bold mt-[22px]">No orders yet</h4>
          <p className="h6-regular text-gray-500 mt-[7px] max-w-[280px]">
            Orders you place are kept here on this device, receipt and all. Fill a basket
            and this screen fills itself.
          </p>

          <Button
            colorType="success"
            sx={{ height: 50, borderRadius: 50, marginTop: '22px', paddingInline: '28px', textTransform: 'none' }}
            onClick={() => router.push('/products')}
          >
            <span className="h5-bold text-white">Browse all products</span>
          </Button>
        </div>

        <BottomNavBar className="mt-[40px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-[33px]">
      <p className="small-regular text-gray-500" data-testid="orders-count">
        {pluralize(orders.length, 'order')}
      </p>

      <ul className="flex flex-col gap-2.5 mt-[15px]">
        {orders.map((order) => (
          /*
            A card is a record, not a control. There is no per-order detail screen, and
            wiring a row to a route that does not exist is the thing this app has already
            had to undo once — so everything the order holds is printed here instead.
          */
          <li
            key={order.transactionCode}
            data-testid="order-item"
            className="flex flex-col rounded-2xl border border-[var(--color-flash-white)] p-[15px]"
          >
            <div className="flex items-center justify-between gap-2.5">
              <b className="h5-bold" data-testid="order-date">{order.placedAt}</b>
              <b className="h5-bold" data-testid="order-total">${order.total}</b>
            </div>

            <div className="flex items-center justify-between gap-2.5 mt-[5px]">
              <span className="h6-regular text-gray-500" data-testid="order-item-count">
                {pluralize(countItems(order), 'item')}
                {' · '}
                {order.paymentMethod}
              </span>

              <span className="small-regular text-gray-500" data-testid="order-code">
                #{order.transactionCode}
              </span>
            </div>

            <ul className="flex flex-col gap-2.5 mt-[15px]">
              {order.items.map((item) => (
                <OrderLine key={item.id} item={item} />
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <BottomNavBar className="mt-[22px]" />
    </div>
  );
}
