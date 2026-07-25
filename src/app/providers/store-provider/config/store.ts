import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from './rootReducer'
import { persistenceMiddleware } from './persistence.middleware'

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(persistenceMiddleware),
})

export type { RootState } from './rootReducer'
export type AppDispatch = typeof store.dispatch
