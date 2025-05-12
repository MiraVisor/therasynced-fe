import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';

export const loginApi = async (data: { email: string; password: string }) => {
  const response = await api.post(ENDPOINTS.auth.login, data);

  const userDetails = {
    token: response?.data.data?.access_token,
    name: response?.data.data?.name,
    address: response?.data.data?.address,
    email: response?.data.data?.email,
    contactNumber: response?.data.data?.contactNumber,
    profilePic: response?.data.data?.profilePic,
    subscription: response?.data.data?.subscription,
  };
  // console.log("User23423:", userDetails)
  // Store the userDetails object in localStorage
  localStorage.setItem('userDetails', JSON.stringify(userDetails));
  localStorage.setItem('token', response?.data.data?.access_token);

  return response.data;
};
