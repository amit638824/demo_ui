import { createSlice, } from "@reduxjs/toolkit";

const initialState: any = {
  userDetail: null,
};

const userSlice = createSlice({
  name: "userDetail",
  initialState,
  reducers: {
    setUserDetails(state, action: any) {
      state.userDetail = action.payload;
    },
    updateUserDetails(state, action: any) {
      state.userDetail = {
        ...state.userDetail,
        ...action.payload,
      };
    },
    clearUserDetails(state) {
      state.userDetail = null;
    },
  },
});

export const { setUserDetails, clearUserDetails, updateUserDetails } = userSlice.actions;
export default userSlice.reducer;
