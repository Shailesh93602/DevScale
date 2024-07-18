import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    name: "",
    email: "",
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    initialUser: (state, payload) => {
      state.user = payload.actions;
    },
    logoutUser: (state) => {
      state.user = initialState.user;
    },
  },
});

export const { initialUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
