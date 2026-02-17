import axiosInstance from "./index";

 

export const loginService = async (data: any) => {
  const res = await axiosInstance.post("/auth/email-login", data);
  return res.data;  
};

export const recruiterRegistrationService = async (data: any) => {
  const res = await axiosInstance.post("/auth/recruiter-register", data);
  return res.data;
};

// 🔹 Forgot Password Service   
export const forgotPasswordService = async (email: string ) => { 
  const res = await axiosInstance.post("/auth/forget-password", { email });
  return res.data;
};

export const resetlinkExpireCheckService = async (data: any) => {
  const res = await axiosInstance.post("/auth/reset-token-check", data);
  return res.data;
}; 
// 🔹 Reset Password
export const resetPasswordService = async (data: any) => {
  const res = await axiosInstance.post("/auth/reset-password", data);
  return res.data;
};

 export const socialLoginService = async (idToken: string) => {
  const res = await axiosInstance.post("/auth/social-login", { idToken });
  return res.data;
};


 export const userDetailService = async (id: string) => {
  const res = await axiosInstance.get(`/auth/user-info?id=${id}`);
  return res.data;
};

export const sendOtpService = async (data: any) => {
  const res = await axiosInstance.post("/auth/send-otp", data);
  return res.data;  
};

export const sendSuperAdminOtpService = async (data: any) => {
  const res = await axiosInstance.post("/api/super-admin-send", data);
  return res.data;  
};

export const verifyOtpService = async (data: any) => {
  const res = await axiosInstance.post("/auth/mobile-login", data);
  return res.data;  
};

export const verifySuperAdminOtpService = async (data: any) => {
  const res = await axiosInstance.post("/api/super-admin-verify", data);
  return res.data;  
};


