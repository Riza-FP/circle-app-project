import api from "../../services/api";

export const registerUser = async (data: any) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const loginUser = async (data: any) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const checkAuth = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }
  return api.get("/auth/check");
};

export const getProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }
  return api.get("/profile");
};
