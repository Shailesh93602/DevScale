import { IUser } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: IUser | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  detailsComplete: boolean;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
  detailsComplete: false,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ user: IUser; detailsComplete?: boolean }>,
    ) => {
      state.user = action.payload.user;
      state.detailsComplete = Boolean(action.payload.detailsComplete);
      state.status = 'succeeded';
    },
    clearUser: (state) => {
      state.user = null;
      state.status = 'idle';
    },
    setLoading: (state) => {
      state.status = 'loading';
    },
    completeUserDetails: (state) => {
      if (state.user) {
        state.detailsComplete = true;
      }
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
  // Add extraReducers for async operations if needed
});

export const {
  setUser,
  clearUser,
  setLoading,
  completeUserDetails,
  setAuthenticated,
} = userSlice.actions;
export default userSlice.reducer;
