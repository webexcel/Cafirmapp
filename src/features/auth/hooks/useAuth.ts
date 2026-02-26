import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../app/store';
import { setUser, logout as logoutAction, setLoading } from '../slice';
import { saveToken, getToken, removeToken } from '../../../utils/secureStorage';
import { storage } from '../../../utils/storage';
import { authApi } from '../../../api/auth.api';
import { USER_KEY } from '../../../constants/config';
import { queryClient } from '../../../app/queryClient';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, user, isLoading } = useSelector((state: RootState) => state.auth);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const { token, userdata } = res.data;
    await saveToken(token);
    await storage.setObject(USER_KEY, userdata);
    dispatch(setUser(userdata));
    return res.data;
  };

  const logout = async () => {
    await removeToken();
    await storage.remove(USER_KEY);
    queryClient.clear();
    dispatch(logoutAction());
  };

  const restoreSession = async () => {
    dispatch(setLoading(true));
    const token = await getToken();
    if (token) {
      const savedUser = await storage.getObject(USER_KEY);
      if (savedUser) {
        dispatch(setUser(savedUser as any));
        return;
      }
    }
    dispatch(setLoading(false));
  };

  return { isLoggedIn, user, isLoading, login, logout, restoreSession };
};
