import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoaderState {
  isLoading: boolean;
  requests: string[]; // Track individual requests
}

const initialState: LoaderState = {
  isLoading: false,
  requests: [],
};

const loaderSlice = createSlice({
  name: 'loader',
  initialState,
  reducers: {
    showLoader: (state, action: PayloadAction<string>) => {
      state.requests.push(action.payload);
      state.isLoading = true;
    },
    hideLoader: (state, action: PayloadAction<string>) => {
      state.requests = state.requests.filter((req) => req !== action.payload);
      state.isLoading = state.requests.length > 0;
    },
  },
});

export const { showLoader, hideLoader } = loaderSlice.actions;
export default loaderSlice.reducer;
