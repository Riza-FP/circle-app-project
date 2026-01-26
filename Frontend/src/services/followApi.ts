import api from "./api";

export const getFollows = async (type: "followers" | "following") => {
    return api.get(`/follows?type=${type}`);
};

export const followUser = async (followed_user_id: number) => {
    return api.post("/follows", { followed_user_id });
};

export const unfollowUser = async (followed_id: number) => {
    return api.delete("/follows", { data: { followed_id } });
};
