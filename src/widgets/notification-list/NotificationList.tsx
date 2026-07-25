import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/app/providers/store-provider/config/hooks';
import {
  markAllNotificationsRead,
  selectNotifications,
  selectNotificationsHydrated,
} from '@/entities/notification';
import { BottomNavBar } from '@/features/bottom-nav-bar';
import Button from '@/shared/ui/Button';

/**
 * Everything the app has told the user about, newest first.
 *
 * There is exactly one producer of notifications — placing an order — so this list is
 * empty until the purchase loop has actually been run. That makes the empty state the
 * screen most visitors will see, and it is designed rather than left blank.
 */
export default function NotificationList() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const notifications = useAppSelector(selectNotifications);
  const isHydrated = useAppSelector(selectNotificationsHydrated);

  /**
   * Which notifications were still unread when this screen was opened.
   *
   * Opening the inbox is what marks it read, but clearing the badge and quietly
   * dropping every "new" marker in the same frame would hide the one thing the user
   * came to see. The ids are snapshotted first, so the rows that were waiting stay
   * marked for as long as the screen is open. `null` means the snapshot has not been
   * taken yet, which is not the same as "nothing was unread".
   */
  const [unreadOnArrival, setUnreadOnArrival] = useState<string[] | null>(null);

  useEffect(() => {
    // Waiting for hydration matters: on a cold load this screen mounts before storage
    // has been read, and marking an empty inbox read would leave the restored
    // notifications — and the badge counting them — untouched.
    if (!isHydrated || unreadOnArrival) return;

    setUnreadOnArrival(notifications.filter((item) => !item.read).map((item) => item.id));
    dispatch(markAllNotificationsRead());
  }, [isHydrated, unreadOnArrival, notifications, dispatch]);

  if (!isHydrated) {
    return (
      <div className="flex flex-col pb-[33px]">
        <p className="small-regular text-gray-500" data-testid="notifications-loading">
          Loading notifications
        </p>
        <BottomNavBar className="mt-2.5" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col pb-[33px]">
        <div
          className="flex flex-col items-center text-center mt-[40px]"
          data-testid="notifications-empty"
        >
          <div className="flex items-center justify-center w-[90px] h-[90px] rounded-full bg-[var(--color-flash-white)]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M12 3.5a5.5 5.5 0 0 0-5.5 5.5v3.086l-1.207 2.414A1 1 0 0 0 6.19 16h11.62a1 1 0 0 0 .897-1.5L17.5 12.086V9A5.5 5.5 0 0 0 12 3.5Z"
                stroke="#00824B"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path d="M10 19a2 2 0 0 0 4 0" stroke="#00824B" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>

          <h4 className="h4-bold mt-[22px]">No notifications yet</h4>
          <p className="h6-regular text-gray-500 mt-[7px] max-w-[280px]">
            Order confirmations land here. Place an order and you will find it waiting.
          </p>

          <Button
            colorType="success"
            sx={{ height: 50, borderRadius: 50, marginTop: '22px', paddingInline: '28px', textTransform: 'none' }}
            onClick={() => router.push('/')}
          >
            <span className="h5-bold text-white">Browse the catalog</span>
          </Button>
        </div>

        <BottomNavBar className="mt-[40px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-[33px]">
      <p className="small-regular text-gray-500" data-testid="notifications-count">
        {notifications.length === 1 ? '1 notification' : `${notifications.length} notifications`}
      </p>

      <ul className="flex flex-col gap-2.5 mt-[15px]">
        {notifications.map((notification) => {
          const wasUnread = unreadOnArrival?.includes(notification.id) ?? false;

          return (
            /*
              A row is a record, not a control. There is no order detail screen to open,
              and wiring the row to a route that does not exist is the thing this app
              has already had to undo once.
            */
            <li
              key={notification.id}
              data-testid="notification-item"
              data-unread={wasUnread ? 'true' : 'false'}
              className={`flex gap-2.5 rounded-2xl p-[15px] ${wasUnread ? 'bg-[var(--color-flash-white)]' : 'bg-white border border-[var(--color-flash-white)]'}`}
            >
              <span
                aria-hidden="true"
                className={`mt-[6px] shrink-0 w-2 h-2 rounded-full ${wasUnread ? 'bg-[var(--color-green-500)]' : 'bg-transparent'}`}
              />

              <div className="flex flex-col gap-[5px] w-full">
                <div className="flex items-center justify-between gap-2.5">
                  <b className="h5-bold">{notification.title}</b>
                  {wasUnread && (
                    <span
                      className="small-bold text-[var(--color-green-500)]"
                      data-testid="notification-new-marker"
                    >
                      New
                    </span>
                  )}
                </div>

                <p className="h6-regular">{notification.message}</p>

                <div className="flex items-center justify-between gap-2.5 mt-[5px]">
                  <span className="small-regular text-gray-500">{notification.createdAt}</span>
                  {notification.orderCode && (
                    <span className="small-regular text-gray-500" data-testid="notification-order-code">
                      #{notification.orderCode}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <BottomNavBar className="mt-[22px]" />
    </div>
  );
}
