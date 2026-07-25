import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from './config/store'
import { hydrateOrders, readStoredOrders } from '@/entities/order'
import { hydrateNotifications, readStoredNotifications } from '@/entities/notification'

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  // Storage is read after mount and never during render, so the server render and
  // the first client render both start from the same empty state and persisted data
  // cannot cause a hydration mismatch. Both actions are dispatched unconditionally,
  // including when nothing was stored, so the "hydrated" flags always flip and a
  // genuinely empty history shows its empty state instead of a permanent spinner.
  useEffect(() => {
    store.dispatch(hydrateOrders(readStoredOrders()))
    store.dispatch(hydrateNotifications(readStoredNotifications()))
  }, [])

  return <Provider store={store}>{children}</Provider>
}
