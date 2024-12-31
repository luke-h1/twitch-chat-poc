import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { twitchApi } from "./slices/twitch";
import chat from "./slices/chat/slice";

export const makeStore = () =>
  configureStore({
    reducer: {
      chat,
      [twitchApi.reducerPath]: twitchApi.reducer,
    },
    // @ts-expect-error - todo
    middleware: (getDefaultMiddleware) => [
      ...getDefaultMiddleware({ serializableCheck: false }),
      twitchApi.middleware,
    ],
  });

const store = makeStore();

// https://redux-toolkit.js.org/rtk-query/usage/cache-behavior#re-fetching-on-window-focus-with-refetchonfocus
// enable listener behavior for the store
// setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default store;
