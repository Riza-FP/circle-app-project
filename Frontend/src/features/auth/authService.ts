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
  const response = await api.get("/auth/check");
  return response.data;
};
