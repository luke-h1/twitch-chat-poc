import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    chat,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatcch = typeof store.dispatch;
