import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import threadReducer from "./threadSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    threads: threadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
