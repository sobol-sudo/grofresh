import { readJson, writeJson } from '@/shared/lib/persistence';
import type { AppNotification, NotificationKind } from '../model/notification.slice';

export const NOTIFICATIONS_STORAGE_KEY = 'grofresh.notifications.v1';

const NOTIFICATION_KINDS: NotificationKind[] = ['order-placed'];

function isStoredNotification(value: unknown): value is AppNotification {
  if (typeof value !== 'object' || value === null) return false;
  const notification = value as Record<string, unknown>;

  return (
    typeof notification.id === 'string' &&
    typeof notification.title === 'string' &&
    typeof notification.message === 'string' &&
    typeof notification.createdAt === 'string' &&
    typeof notification.read === 'boolean' &&
    (typeof notification.orderCode === 'string' || notification.orderCode === null) &&
    // A kind this build does not know about would render as a blank row.
    NOTIFICATION_KINDS.includes(notification.kind as NotificationKind)
  );
}

/**
 * Reads the persisted inbox.
 *
 * @returns the stored notifications, or an empty list when storage is unavailable,
 *          blocked, empty or corrupted. The unread badge counts what comes back
 *          from here, so a bad payload has to read as zero rather than as a guess.
 */
export function readStoredNotifications(): AppNotification[] {
  return (
    readJson<AppNotification[]>(NOTIFICATIONS_STORAGE_KEY, (value) =>
      Array.isArray(value) && value.every(isStoredNotification)
        ? (value as AppNotification[])
        : null
    ) ?? []
  );
}

export function writeStoredNotifications(notifications: AppNotification[]): void {
  writeJson(NOTIFICATIONS_STORAGE_KEY, notifications);
}
