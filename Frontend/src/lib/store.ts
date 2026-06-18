import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
// Import the storage *factory*, not the default `redux-persist/lib/storage`.
// The default module calls createWebStorage('local') at import time, which on
// the server (no window) logs "redux-persist failed to create sync storage".
// Calling the factory lazily — only in the browser — avoids that SSR warning.
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import userReducer from './features/user/userSlice';
import loaderReducer from './features/loader/loaderSlice';

const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: unknown) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage();

const persistStorage =
  typeof window !== 'undefined' ? storage : createNoopStorage();

const rootReducer = combineReducers({
  user: userReducer,
  loader: loaderReducer,
});

const persistConfig = {
  key: 'root',
  storage: persistStorage,
  whitelist: ['user'], // Only persist user data
  blacklist: ['loader'], // Don't persist loader state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Infer the RootState and AppDispatch types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
