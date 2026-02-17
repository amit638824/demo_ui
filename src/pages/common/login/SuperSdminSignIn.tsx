"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { FaRegEyeSlash } from "react-icons/fa";
import { login } from "@/redux/slice/authSlice";
import Loader from "@/ui/common/loader/Loader";

import {
  sendOtpService,
  verifyOtpService,
  loginService,
  sendSuperAdminOtpService,
  verifySuperAdminOtpService,
} from "@/services/AuthServices";
import { getUserPermissions } from "@/services/SuperAdminService";

/* ================= VALIDATION ================= */

const getSchema = (loginToggle: string) =>
  Yup.object({
    email:
      loginToggle === "email"
        ? Yup.string().email("Invalid email").required("Email is required")
        : Yup.string().nullable(),

    password:
      loginToggle === "email"
        ? Yup.string().required("Password is required")
        : Yup.string().nullable(),

    mobile:
      loginToggle === "mobile"
        ? Yup.string()
            .matches(/^[0-9]{10}$/, "Enter valid 10 digit mobile number")
            .required("Mobile number is required")
        : Yup.string().nullable(),

    otp:
      loginToggle === "mobile"
        ? Yup.string()
            .length(6, "OTP must be 6 digits")
            .required("OTP is required")
        : Yup.string().nullable(),
  });

const SuperSdminSignIn = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [loginToggle, setLoginToggle] = useState("email");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(45);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    resetField,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(getSchema(loginToggle)),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const mobile = watch("mobile");
  const otp = watch("otp");

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!otpSent || timer === 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  /* ================= RESET WHEN TOGGLE ================= */
  useEffect(() => {
    resetField("email");
    resetField("password");
    resetField("mobile");
    resetField("otp");
    setOtpSent(false);
  }, [loginToggle]);

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    if (!mobile || mobile.length !== 10) {
      setError("mobile", { message: "Enter valid 10 digit mobile number" });
      return;
    }

    try {
      setLoading(true);
      const res = await sendSuperAdminOtpService({
        mobile,
        userType: "super_admin",
      });

      if (!res?.success) {
        toast.error(res.message || "Failed to send OTP");
        return;
      }

      setOtpSent(true);
      setTimer(45);
      setValue("otp", "");
      toast.success("OTP sent successfully");
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= MAIN SUBMIT ================= */
  const onSubmit = async (formData: any) => {
    try {
      setLoading(true);

      /* ================= EMAIL LOGIN ================= */
      if (loginToggle === "email") {
        const response: any = await loginService(formData);

        if (!response?.success) {
          toast.error(response?.message || "Login failed");
          return;
        }

        if (rememberMe) {
          localStorage.setItem(
            "rememberMe",
            JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          );
        } else {
          localStorage.removeItem("rememberMe");
        }

        localStorage.setItem("token", response.data.token);
        const roleId = response.data.user?.roletbl_id;

        const permRes = await getUserPermissions(roleId);

        const permissions = permRes?.data?.items?.filter((p: any) => p.status === 1)?.map((p: any) => p.permissionKey) || [];

        dispatch(
          login({
            token: response.data.token,
            user: response.data.user,
             permissions,
          }),
        );

        const role = response.data.user?.roletbl_roleName;
        const isProfileCompleted = response.data.user?.user_isProfileCompleted;
        if(role=='RECRUITER'){
          if (isProfileCompleted === 0) {
              router.replace("/recruiter/complete-profile");
              return;
            }
            router.replace("/recruiter");
          
        }else{
          router.replace("/super-admin");
        }
// router.replace("/super-admin");
        // switch (role) {
        //   case "SUPER_ADMIN":
        //     router.replace("/super-admin");
        //     break;
        //   case "OPERATIONS_ADMIN":
        //     router.replace("/operations-admin");
        //     break;
        //   case "FINANCE_ADMIN":
        //     router.replace("/finance-admin");
        //     break;
        //   case "SUPPORT_ADMIN":
        //     router.replace("/support-admin");
        //     break;
        //   case "RECRUITER":
        //     if (isProfileCompleted === 0) {
        //       router.replace("/recruiter/complete-profile");
        //       return;
        //     }
        //     router.replace("/recruiter");
        //     break;
        //   default:
        //     router.replace("/");
        //}

        toast.success("Login successful");
      } else {
        /* ================= MOBILE LOGIN ================= */
        const res = await verifySuperAdminOtpService({
          mobile: formData.mobile,
          otp: formData.otp,
          userType:"super_admin"
        });

        if (!res?.success) {
          setError("otp", { message: res.message || "Invalid OTP" });
          toast.error(res.message || "Invalid OTP");
          return;
        }

        const { token, user } = normalizeAuthResponse(res);

        localStorage.setItem("token", token);
        
        const roleId = user?.roletbl_id;

        const permRes = await getUserPermissions(roleId);

        const permissions = permRes?.data?.items?.filter((p: any) => p.status === 1)?.map((p: any) => p.permissionKey) || [];

        dispatch(login({ token, user,permissions }));

        toast.success("Login successful");

        router.replace("/super-admin");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong!");
    } finally {
      //setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-themebg recruiterLogin">
      {loading && <Loader />}

      <div className="card p-4 shadow-lg superAdmin loginBox">
        <div className="loginUp">
          <div className="text-center logoDiv">
            <Image
              src="/assets/images/logo.png"
              width={150}
              height={74}
              alt="Logo"
            />
          </div>

          {/* TOGGLE */}
          <div className="d-flex justify-content-center gap-4 mb-4">
  <div className="form-check d-flex align-items-center">
    <input
      className="form-check-input"
      type="radio"
      value="email"
      checked={loginToggle === "email"}
      onChange={(e) => setLoginToggle(e.target.value)}
      id="loginEmail"
    />
    <label className="form-check-label ms-2 mb-0" htmlFor="loginEmail">
      Login with Email
    </label>
  </div>

  <div className="form-check d-flex align-items-center">
    <input
      className="form-check-input"
      type="radio"
      value="mobile"
      checked={loginToggle === "mobile"}
      onChange={(e) => setLoginToggle(e.target.value)}
      id="loginMobile"
    />
    <label className="form-check-label ms-2 mb-0" htmlFor="loginMobile">
      Login with Mobile
    </label>
  </div>
</div>


          <form onSubmit={handleSubmit(onSubmit)}>
            {/* ================= EMAIL UI ================= */}
            {loginToggle === "email" && (
              <>
                <div className="mb-3 position-relative">
                  <label className="form-label">Email Address</label>

                  <input
                    type="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    {...register("email")}
                  />

                  {errors.email && (
                    <div className="text-danger">{errors.email.message}</div>
                  )}
                </div>

                <div className="mb-3 position-relative">
                  <label className="form-label">Password</label>

                  <span className="eyeComponent">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      {...register("password")}
                    />

                    <span
                      className="eyeicon"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {!errors.password &&
                        (showPassword ? (
                          <MdOutlineRemoveRedEye />
                        ) : (
                          <FaRegEyeSlash />
                        ))}
                    </span>
                  </span>

                  {errors.password && (
                    <div className="text-danger">{errors.password.message}</div>
                  )}
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <div>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="ms-2">Remember me</label>
                  </div>

                  <Link href="/forget-password" className="themeBlue">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  className="btn btn-primary w-100"
                  style={{ backgroundColor: "#0f5280", borderColor: "#0f5280" }}
                  disabled={loading}
                >
                  Login
                </button>
              </>
            )}

            {/* ================= MOBILE UI ================= */}
            {loginToggle === "mobile" && (
              <>
                <div className="mb-3 position-relative">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    className={`form-control ${errors.mobile ? "is-invalid" : ""}`}
                    {...register("mobile", {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/\D/g, "");
                        clearErrors("mobile");
                      },
                    })}
                  />


                  {errors.mobile && (
                    <div className="text-danger">{errors.mobile.message}</div>
                  )}
                  {otpSent && (
                  <div className="d-flex justify-content-end mt-2">
                    {timer > 0 ? (
                      <span className="text-muted small">
                        Resend OTP in {timer}s
                      </span>
                    ) : (
                      <span
                        className="themeBlue small"
                        style={{ cursor: "pointer" }}
                        onClick={sendOtp}
                      >
                        Resend OTP
                      </span>
                    )}
                  </div>
                )}


                  {!otpSent && (
                    <button
                      type="button"
                      className="btn btn-primary mt-4 form-control"
                      onClick={sendOtp}
                      style={{
                        backgroundColor: "#0f5280",
                        borderColor: "#0f5280",
                      }}
                    >
                      Send OTP
                    </button>
                  )}
                </div>

                {otpSent && (
                  <>
                    <OtpInput
                      value={otp || ""}
                      onChange={(val: string) => setValue("otp", val)}
                    />

                    {/* {errors.otp && (
                      <div className="text-danger mt-1">
                        {errors.otp.message}
                      </div>
                    )} */}

                    {/* <div className="mt-2">
                      {timer > 0 ? (
                        <span>Resend OTP in {timer}s</span>
                      ) : (
                        <span style={{ cursor: "pointer" }} onClick={sendOtp}>
                          Resend OTP
                        </span>
                      )}
                    </div> */}

                    <button
                      className="btn btn-primary w-100 mt-3"
                      type="submit"
                      disabled={otp?.length !== 6}
                      style={{
                        backgroundColor: "#0f5280",
                        borderColor: "#0f5280",
                      }}
                    >
                      Verify & Login
                    </button>
                  </>
                )}
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

/* ================= OTP INPUT ================= */

const OtpInput = ({ length = 6, value, onChange }: any) => {
  const inputsRef = useRef<HTMLInputElement[]>([]);

  const handleChange = (e: any, i: number) => {
    const digit = e.target.value.replace(/\D/, "");
    if (!digit) return;

    const arr = value.split("");
    arr[i] = digit;
    onChange(arr.join(""));
    inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (e: any, i: number) => {
    if (e.key === "Backspace") {
      const arr = value.split("");
      arr[i] = "";
      onChange(arr.join(""));
      inputsRef.current[i - 1]?.focus();
    }
  };

  return (
    <div className="otpInputFields">
      {[...Array(length)].map((_, i) => (
        <input
          key={i}
          ref={(el: any) => (inputsRef.current[i] = el!)}
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="form-control text-center fw-bold"
        />
      ))}
    </div>
  );
};

export default SuperSdminSignIn;
const normalizeAuthResponse = (res: any) => {
  if (!res?.success || !res?.data) {
    throw new Error("Invalid auth response");
  }

  const { data } = res;

  /* EMAIL / SOCIAL LOGIN */
  if (data.user?.user_id) {
    return {
      token: data.token,
      user: data.user,
    };
  }

  /* MOBILE OTP LOGIN */
  if (data.user?.id) {
    return {
      token: data.token,
      user: {
        user_id: data.user.id,
        user_fullName: data.user.fullname,
        user_email: data.user.email,
        user_mobile: data.user.mobile,
        user_RoleId: data.user.roleid,
        user_isProfileCompleted: data.user.newUser ? 0 : 1,
        roletbl_id: data.user.roleid,
        roletbl_roleName: data.user.rolename,
      },
    };
  }

  throw new Error("Unknown login response format");
};
