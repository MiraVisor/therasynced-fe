import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import { registerUserTypes } from "@/types/types";

export const loginApi = async (data: { email: string; password: string }) => {
  const response = await api.post(ENDPOINTS.auth.login, data);

  // const userDetails = {
  //   token: response?.data.data?.access_token,
  //   name: response?.data.data?.name,
  //   address: response?.data.data?.address,
  //   email: response?.data.data?.email,
  //   contactNumber: response?.data.data?.contactNumber,
  //   profilePic: response?.data.data?.profilePic,
  //   subscription: response?.data.data?.subscription,
  // };

  // localStorage.setItem("userDetails", JSON.stringify(userDetails));
  // localStorage.setItem("token", response?.data.data?.access_token);

  return response.data;
};

export const signUpUserApi = async (data: registerUserTypes) => {
  const response = await api.post("auth/signup", data);
  return response.data;
};
