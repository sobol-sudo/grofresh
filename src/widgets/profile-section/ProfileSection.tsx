import { useRouter } from 'next/router';
import { useAppSelector } from '@/app/providers/store-provider/config/hooks';
import { selectOrders, selectOrdersHydrated } from '@/entities/order';
import {
  selectNotifications,
  selectNotificationsHydrated,
  selectUnreadNotificationCount,
} from '@/entities/notification';
import { useTelegram } from '@/shared/hooks/useTelegram/useTelegram';
import { BottomNavBar } from '@/features/bottom-nav-bar';
import Avatar from '@/shared/ui/Avatar';
import Button from '@/shared/ui/Button';
import { pluralize } from '@/shared/lib/pluralize';

/** Shared so the two stat tiles cannot drift apart. */
const TILE_CLASS = 'flex flex-col gap-[5px] h-full rounded-2xl bg-[var(--color-flash-white)] p-[15px]';

/**
 * The account screen behind the Profile tab.
 *
 * Everything on it is either the identity Telegram handed us or a number counted out
 * of the persisted history — there is no profile server to ask, so there is nothing
 * here that the user did not create themselves.
 *
 * Outside Telegram there is no user at all. That is the normal case in a browser, so
 * the guest state is written out explicitly rather than left as a blank name: the same
 * "Guest" the home header already falls back to, plus a line saying where a real name
 * would come from.
 */
export default function ProfileSection() {
  const router = useRouter();
  const { user } = useTelegram();

  const orders = useAppSelector(selectOrders);
  const ordersHydrated = useAppSelector(selectOrdersHydrated);
  const notifications = useAppSelector(selectNotifications);
  const notificationsHydrated = useAppSelector(selectNotificationsHydrated);
  const unreadCount = useAppSelector(selectUnreadNotificationCount);

  const latestOrder = orders[0] ?? null;

  return (
    <div className="flex flex-col pb-[33px]">
      <div className="flex items-center gap-[15px]" data-testid="profile-identity">
        <Avatar src={user?.photo_url} size={70} />

        <div className="flex flex-col gap-[5px]">
          <b className="h3-bold" data-testid="profile-name">{user?.name || 'Guest'}</b>

          {user ? (
            <span className="h6-regular text-gray-500" data-testid="profile-provenance">
              Signed in with Telegram
            </span>
          ) : (
            <span className="h6-regular text-gray-500" data-testid="profile-provenance">
              Browsing as a guest
            </span>
          )}
        </div>
      </div>

      {!user && (
        <p className="small-regular text-gray-500 mt-[15px]" data-testid="profile-guest-hint">
          Open GroFresh inside Telegram to see your name and photo here. Your cart, orders
          and notifications work either way — they are kept on this device.
        </p>
      )}

      <div className="flex gap-2.5 mt-[22px]">
        {/*
          The count and the screen that lists what it counted, rather than a second copy
          of the history rendered here. Same shape as the notifications tile beside it:
          a button, because it navigates, and it navigates because /orders exists.
        */}
        <button
          type="button"
          className="flex-1 basis-0 text-left cursor-pointer"
          data-testid="profile-order-count"
          onClick={() => router.push('/orders')}
        >
          <div className={TILE_CLASS}>
            <b className="h3-bold">{ordersHydrated ? orders.length : '—'}</b>
            <span className="h6-regular text-gray-500">
              {orders.length === 1 ? 'Order placed' : 'Orders placed'}
            </span>
          </div>
        </button>

        {/*
          A tile that leads somewhere real: the inbox this count is read from. It is a
          button rather than a card because it navigates, and it navigates because the
          screen it opens exists.

          The padding and the fill sit on the inner element on purpose — the global
          reset zeroes both on every `button`, from outside a cascade layer, so a
          utility class on the button itself would silently lose.
        */}
        <button
          type="button"
          className="flex-1 basis-0 text-left cursor-pointer"
          data-testid="profile-notifications-link"
          onClick={() => router.push('/notifications')}
        >
          <div className={TILE_CLASS}>
            <span className="flex items-baseline gap-2">
              <b className="h3-bold">{notificationsHydrated ? notifications.length : '—'}</b>
              {unreadCount > 0 && (
                <span className="small-bold text-[var(--color-green-500)]" data-testid="profile-unread-marker">
                  {unreadCount} new
                </span>
              )}
            </span>
            <span className="h6-regular text-gray-500">
              {notifications.length === 1 ? 'Notification' : 'Notifications'}
            </span>
          </div>
        </button>
      </div>

      <h4 className="h4-bold mt-[22px]">Last order</h4>

      {latestOrder ? (
        <div
          className="flex flex-col gap-[7px] rounded-2xl border border-[var(--color-flash-white)] p-[15px] mt-[15px]"
          data-testid="profile-last-order"
        >
          <div className="flex items-center justify-between gap-2.5">
            <b className="h5-bold">${latestOrder.total}</b>
            <span className="small-regular text-gray-500">#{latestOrder.transactionCode}</span>
          </div>

          <span className="h6-regular text-gray-500">
            {pluralize(
              latestOrder.items.reduce((total, item) => total + item.quantity, 0),
              'item'
            )}
            {' · '}
            {latestOrder.paymentMethod}
          </span>

          <span className="small-regular text-gray-500">{latestOrder.placedAt}</span>
        </div>
      ) : (
        <div className="flex flex-col items-start mt-[15px]" data-testid="profile-no-orders">
          <p className="h6-regular text-gray-500 max-w-[300px]">
            {ordersHydrated
              ? 'Nothing bought yet. Once you check out, your most recent order shows up here.'
              : 'Looking for your past orders on this device.'}
          </p>

          {ordersHydrated && (
            <Button
              colorType="success"
              sx={{ height: 50, borderRadius: 50, marginTop: '15px', paddingInline: '28px', textTransform: 'none' }}
              onClick={() => router.push('/')}
            >
              <span className="h5-bold text-white">Browse the catalog</span>
            </Button>
          )}
        </div>
      )}

      <BottomNavBar className="mt-[22px]" />
    </div>
  );
}
