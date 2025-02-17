import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  username: string;
  email: string;
  // Add other user fields as needed
  detailsComplete: boolean;
}

interface AuthState {
  user: UserState | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.user = action.payload;
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
        state.user.detailsComplete = true;
      }
    },
  },
  // Add extraReducers for async operations if needed
});

export const { setUser, clearUser, setLoading, completeUserDetails } =
  userSlice.actions;
export default userSlice.reducer;
