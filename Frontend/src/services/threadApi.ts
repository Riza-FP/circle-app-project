import api from "./api";

export const getThreads = async () => {
    return api.get("/thread?limit=25");
};

export const createThread = async (content: string) => {
    return api.post("/thread", { content });
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
