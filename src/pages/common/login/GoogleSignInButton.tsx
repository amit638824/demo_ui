"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { socialLoginService } from "@/services/AuthServices";
import { useDispatch } from "react-redux";
import { login } from "@/redux/slice/authSlice";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";
export default function GoogleButton() {
  const dispatch = useDispatch();
  const router = useRouter();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const data = await socialLoginService(tokenResponse.access_token);

        if (data.success) {
          const { token, user }: any = data.data;

          localStorage.setItem("token", token);
          dispatch(login({ user, token }));

          switch (user.roletbl_roleName) {
            case "SUPER_ADMIN":
              router.push("/super-admin");
              break;
            case "OPERATIONS_ADMIN":
              router.push("/operations-admin");
              break;
            case "FINANCE_ADMIN":
              router.push("/finance-admin");
              break;
            case "SUPPORT_ADMIN":
              router.push("/support-admin");
              break;
            case "RECRUITER":
              router.push("/recruiter");
              break;
            default:
              router.push("/");
          }
        }
      } catch (error) {
        console.error("Google Login Error:", error);
      }
    },
    onError: () => console.log("Google Login Failed"),
  });

  return (
    <>
    <span className="socialIcon google" onClick={() => googleLogin()}><FaGoogle /></span>
    {/* <img
      src="/images/google-login.png"
      alt="Login with Google"
      style={{ cursor: "pointer", width: "100%" }}
      onClick={() => googleLogin()}
    /> */}
    </>
  );
}
