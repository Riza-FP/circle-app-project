import api from "./api";

export const getThreads = async () => {
    return api.get("/thread?limit=25");
};

export const createThread = async (data: FormData) => {
    return api.post("/thread", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const likeThread = async (id: number) => {
    return api.post(`/thread/${id}/like`);
};

export const unlikeThread = async (id: number) => {
    return api.delete(`/thread/${id}/like`);
};

export const replyThread = async (id: number, content: string) => {
    return api.post(`/thread/${id}/reply`, { content });
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
