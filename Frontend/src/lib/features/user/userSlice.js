import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    username: "",
    email: "",
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    initialUser: (state, actions) => {
      state.user = actions.payload;
    },
    logoutUser: (state) => {
      state.user = initialState.user;
    },
  },
});

export const { initialUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
