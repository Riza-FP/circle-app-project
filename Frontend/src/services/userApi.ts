import api from "./api";

export const updateProfile = async (formData: FormData) => {
    return api.patch("/profile", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const getSuggestedUsers = async () => {
    return api.get("/users/suggested");
};

export const getUserById = async (id: number) => {
    return api.get(`/users/${id}`);
};
