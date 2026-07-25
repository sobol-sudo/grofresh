import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { placeOrder, type Order } from '@/entities/order'

/**
 * The kinds of thing the app can notify about. There is exactly one today, because
 * placing an order is the only event the app actually has. Adding a kind means
 * adding the event that produces it.
 */
export type NotificationKind = 'order-placed'

export interface AppNotification {
  /** Derived from the event, so replaying the same event cannot duplicate the entry. */
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  /** Formatted at the moment of the event; mirrors the order's own timestamp. */
  createdAt: string;
  read: boolean;
  /** The order this notification is about, so a list can link through to it. */
  orderCode: string | null;
}

/** Matches MAX_STORED_ORDERS: one notification per order, so the two lists stay in step. */
export const MAX_STORED_NOTIFICATIONS = 20

export interface NotificationState {
  /** Newest first. */
  items: AppNotification[];
  /** False until storage has been read, so an empty inbox can be told from a pending one. */
  isHydrated: boolean;
}

const initialState: NotificationState = {
  items: [],
  isHydrated: false,
}

/**
 * Builds the notification for a placed order purely from the order itself.
 *
 * Reducers must stay pure, so there is no clock and no random id here: the
 * transaction code makes the id unique and the order's own timestamp is the one
 * shown on the receipt, which is the timestamp the user expects to see.
 */
function buildOrderPlacedNotification(order: Order): AppNotification {
  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0)

  return {
    id: `order-placed:${order.transactionCode}`,
    kind: 'order-placed',
    title: 'Order placed',
    message: `${itemCount} ${itemCount === 1 ? 'item' : 'items'} for $${order.total}, paid with ${order.paymentMethod}.`,
    createdAt: order.placedAt,
    read: false,
    orderCode: order.transactionCode,
  }
}

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    markNotificationRead(state, action: PayloadAction<string>) {
      const notification = state.items.find((item) => item.id === action.payload)
      if (notification) notification.read = true
    },
    markAllNotificationsRead(state) {
      state.items.forEach((item) => {
        item.read = true
      })
    },
    /**
     * Merges the persisted inbox in, underneath anything this session produced, and
     * without duplicating a notification that is already in memory.
     */
    hydrateNotifications(state, action: PayloadAction<AppNotification[]>) {
      const known = new Set(state.items.map((item) => item.id))
      const restored = action.payload.filter((item) => !known.has(item.id))

      state.items = [...state.items, ...restored].slice(0, MAX_STORED_NOTIFICATIONS)
      state.isHydrated = true
    },
  },
  extraReducers: (builder) => {
    // Notifications are a consequence of events, never something a screen asks for:
    // the only way to get one is to actually place an order.
    builder.addCase(placeOrder, (state, action) => {
      const notification = buildOrderPlacedNotification(action.payload)
      if (state.items.some((item) => item.id === notification.id)) return

      state.items.unshift(notification)

      if (state.items.length > MAX_STORED_NOTIFICATIONS) {
        state.items.splice(MAX_STORED_NOTIFICATIONS)
      }
    })
  },
})

export const { markNotificationRead, markAllNotificationsRead, hydrateNotifications } =
  notificationSlice.actions
export const notificationReducer = notificationSlice.reducer

export const selectNotifications = (state: { notification: NotificationState }) =>
  state.notification.items
export const selectUnreadNotificationCount = (state: { notification: NotificationState }) =>
  state.notification.items.reduce((total, item) => (item.read ? total : total + 1), 0)
export const selectNotificationsHydrated = (state: { notification: NotificationState }) =>
  state.notification.isHydrated
