import type { Middleware, UnknownAction } from '@reduxjs/toolkit'
import { hydrateOrders, writeStoredOrders } from '@/entities/order'
import { hydrateNotifications, writeStoredNotifications } from '@/entities/notification'
import type { RootState } from './rootReducer'

/**
 * Writing back what we just read would be pointless work on every page load.
 */
const HYDRATION_ACTIONS: string[] = [hydrateOrders.type, hydrateNotifications.type]

/**
 * Mirrors the persisted slices into localStorage after every action that changes them.
 *
 * Reducers stay pure and no screen has to remember to save anything: the middleware
 * compares the slice references either side of the reducer, which Immer only replaces
 * when the data actually changed. Writes are best-effort and never throw
 * (see `shared/lib/persistence`), so blocked storage costs history, not the session.
 */
export const persistenceMiddleware: Middleware<object, RootState> = (api) => (next) => (action) => {
  const before = api.getState()
  const result = next(action)
  const after = api.getState()

  const { type } = action as UnknownAction
  if (typeof type === 'string' && HYDRATION_ACTIONS.includes(type)) {
    return result
  }

  if (after.order.orders !== before.order.orders) {
    writeStoredOrders(after.order.orders)
  }

  if (after.notification.items !== before.notification.items) {
    writeStoredNotifications(after.notification.items)
  }

  return result
}
