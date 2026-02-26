import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  employee_id: number;
  name: string;
  email: string;
  role: number;
  photo?: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.isLoading = false;
    },
    logout(state) {
      state.user = null;
      state.isLoggedIn = false;
      state.isLoading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setUser, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
