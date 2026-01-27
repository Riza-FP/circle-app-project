import api from "./api";

export const searchUsers = async (keyword: string) => {
    return api.get(`/search?keyword=${keyword}`);
};
