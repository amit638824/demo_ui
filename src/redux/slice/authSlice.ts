import { createSlice } from "@reduxjs/toolkit";  
const initialState: any = {
  user: {},
  token: null,
  permissions: [],
};

const authSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login(state, action: any) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.permissions = action.payload.permissions || [];
    },

    updateUser(state, action: any) {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },

    logout(state) {
      state.user = {};
      state.token = null;
      state.permissions = [];
      state.isLoggedIn=false
    },
  },
});

export const { login, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
