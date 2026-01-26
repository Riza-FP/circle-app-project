import api from "./api";

export const getThreads = async () => {
    return api.get("/thread?limit=25");
};

export const getThreadById = async (id: number) => {
    return api.get(`/thread/${id}`);
};

export const getReplies = async (threadId: number) => {
    return api.get(`/reply?thread_id=${threadId}`);
};

export const createThread = async (data: FormData) => {
    return api.post("/thread", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const createReply = async (data: FormData) => {
    return api.post("/reply", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const likeThread = async (id: number) => {
    return api.post("/like", { thread_id: id });
};

export const unlikeThread = async (id: number) => {
    return api.delete(`/like/${id}`);
};



export const deleteThread = async (id: number) => {
    return api.delete(`/thread/${id}`);
};

export const updateThread = async (id: number, data: FormData) => {
    return api.patch(`/thread/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const deleteReply = async (id: number) => {
    return api.delete(`/reply/${id}`);
};

export const updateReply = async (id: number, data: FormData) => {
    return api.patch(`/reply/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};
