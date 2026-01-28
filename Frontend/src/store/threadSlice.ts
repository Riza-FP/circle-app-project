import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getThreads, likeThread, unlikeThread } from "../services/threadApi";

interface Thread {
    id: number;
    isLiked: boolean;
    likes: number;
}

interface ThreadState {
    list: Thread[];
    loading: boolean;
}

export const fetchThreads = createAsyncThunk(
    "threads/fetch",
    async () => {
        const response = await getThreads();
        return response.data.data.threads;
    }
);

export const likeThreadOptimistic = createAsyncThunk(
    "threads/likeThread",
    async (threadId: number, { dispatch, getState }) => {
        const state = getState() as { threads: ThreadState };
        const originalThread = state.threads.list.find(t => t.id === threadId);

        dispatch(threadSlice.actions.optimisticLike({ threadId }));

        try {
            await likeThread(threadId);
        } catch (error) {
            // Revert on failure
            if (originalThread) {
                dispatch(threadSlice.actions.revertLike({ thread: originalThread }));
            }
            throw error;
        }
    }
);

export const unlikeThreadOptimistic = createAsyncThunk(
    "threads/unlikeThread",
    async (threadId: number, { dispatch, getState }) => {
        const state = getState() as { threads: ThreadState };
        const originalThread = state.threads.list.find(t => t.id === threadId);

        dispatch(threadSlice.actions.optimisticUnlike({ threadId }));

        try {
            await unlikeThread(threadId);
        } catch (error) {
            // Revert on failure
            if (originalThread) {
                dispatch(threadSlice.actions.revertLike({ thread: originalThread }));
            }
            throw error;
        }
    }
);


const threadSlice = createSlice({
    name: "threads",
    initialState: {
        list: [],
        loading: false,
    } as ThreadState,
    reducers: {
        optimisticLike: (state, action: PayloadAction<{ threadId: number }>) => {
            const thread = state.list.find(t => t.id === action.payload.threadId);
            if (thread) {
                thread.isLiked = true;
                thread.likes++;
            }
        },
        optimisticUnlike: (state, action: PayloadAction<{ threadId: number }>) => {
            const thread = state.list.find(t => t.id === action.payload.threadId);
            if (thread) {
                thread.isLiked = false;
                thread.likes--;
            }
        },
        revertLike: (state, action: PayloadAction<{ thread: Thread }>) => {
            const index = state.list.findIndex(t => t.id === action.payload.thread.id);
            if (index !== -1) {
                state.list[index] = action.payload.thread;
            }
        },
        updateLikesFromWebSocket: (state, action: PayloadAction<{ threadId: number; likes: number }>) => {
            const thread = state.list.find(t => t.id === action.payload.threadId);
            if (thread) {
                thread.likes = action.payload.likes;
            }
        },
        upsertThread: (state, action: PayloadAction<Thread>) => {
            const index = state.list.findIndex(t => t.id === action.payload.id);
            if (index !== -1) {
                state.list[index] = action.payload;
            } else {
                state.list.unshift(action.payload);
            }
        }
    },
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

export const { optimisticLike, optimisticUnlike, revertLike, updateLikesFromWebSocket, upsertThread } = threadSlice.actions;

export default threadSlice.reducer;
