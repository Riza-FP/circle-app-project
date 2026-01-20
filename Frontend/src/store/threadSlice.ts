import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getThreads } from "../services/threadApi";

export const fetchThreads = createAsyncThunk(
    "threads/fetch",
    async () => {
        const response = await getThreads();
        return response.data.data.threads;
    }
);

const threadSlice = createSlice({
    name: "threads",
    initialState: {
        list: [],
        loading: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchThreads.pending, (state) => {
            state.loading = true;
        });

        builder.addCase(fetchThreads.fulfilled, (state, action) => {
            state.list = action.payload;
            state.loading = false;
        });
    },
});

export default threadSlice.reducer;
