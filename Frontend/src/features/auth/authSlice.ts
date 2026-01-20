import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { registerUser, loginUser, checkAuth as apiCheckAuth } from "./authService";

interface AuthState {
  user: any;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
};

export const register = createAsyncThunk(
  "auth/register",
  async (data: any, thunkAPI) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const res = await registerUser(data);
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (data: any, thunkAPI) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const res = await loginUser(data);
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const authCheck = createAsyncThunk(
  "auth/check",
  async (_, thunkAPI) => {
    try {
      const res = await apiCheckAuth();
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(register.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(authCheck.pending, (state) => {
        state.loading = true;
      })
      .addCase(authCheck.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = localStorage.getItem("token");
      })
      .addCase(authCheck.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem("token");
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;
