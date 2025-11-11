import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '@/redux/store';

import { loginUser, logout } from '../slices/authSlice';
import { fetchFreelancerDashboard } from '../slices/freelancerDashboardSlice';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  return {
    ...auth,
    login: (credentials: { email: string; password: string }) => dispatch(loginUser(credentials)),
    logout: () => dispatch(logout()),
  };
};

export const useFreelancerDashboard = () => {
  const dispatch = useAppDispatch();
  const dashboardState = useAppSelector((state) => state.freelancerDashboard);

  return {
    ...dashboardState,
    fetchDashboard: (options: { silent?: boolean } = {}) =>
      dispatch(fetchFreelancerDashboard(options)),
  };
};
