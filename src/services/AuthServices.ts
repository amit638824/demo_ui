import axiosInstance from "./index";

 

export const loginService = async (data: any) => {
  const res = await axiosInstance.post("/api/auth/login", data);
  return res.data;  
};

export const chatService = async (data: any) => {
  const res = await axiosInstance.post("/api/auth/chat", data);
  return res.data;  
};
 