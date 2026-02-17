import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import userDetailReducer from "./slice/userDetailSlice";

const rootReducer = combineReducers({
  user: authReducer,
  userDetail: userDetailReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
