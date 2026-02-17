"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Loader from "@/ui/common/loader/Loader";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // आइकन्स import करें

import {
  resetlinkExpireCheckService,
  resetPasswordService,
} from "@/services/AuthServices";
import { showAlert } from "@/utils/swalFire";
import { useRouter } from "next/navigation";

const schema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Minimum 8 characters required")
    .required("New password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
});

const ResetPassword = () => {
  const [token, setToken] = useState<string>("");
  const [isLinkValid, setIsLinkValid] = useState<boolean>(false);
  const [linkError, setLinkError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });
  
  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get("token");

    if (urlToken) {
      setToken(urlToken);
    } else {
      setLinkError("Invalid reset password link");
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const checkResetLink = async () => {
      try {
        if (!token) return;
         setLoading(true);
        const response = await resetlinkExpireCheckService({ token });
        if (response.success) {
          setIsLinkValid(true);
        } else {
          setLinkError(response.message || "Reset link expired");
        }
      } catch (error: any) {
        setLinkError(
          error?.response?.data?.message || "Reset link expired"
        );
      } finally {
        setLoading(false);
      }
    };

    checkResetLink();
  }, [token]);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const onSubmit = async (formData: any) => {
    if (!token) {
      showAlert("error", "Invalid or expired reset link!", "Failed");
      return;
    }

    try {
      const response = await resetPasswordService({
        token,
        password: formData.password,
      });

      showAlert(
        response.success ? "success" : "error",
        response.message,
        response.success ? "Success" : "Failed"
      );

      if (response.success) {
        reset();
        router.push("/")
      }
    } catch (error: any) {
      showAlert(
        "error",
        error?.response?.data?.message || "Something went wrong!",
        "Failed"
      );
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-themebg">
      <div className="card p-4 shadow-lg loginBox">
        {/* Loading */}
        {loading && <Loader />}

        {/* Expired / Invalid Link */}
        {!loading && !isLinkValid && (
          <div className="linkEmail"><h4 className="text-center text-danger">{linkError}</h4></div>
        )}

        {/* Reset Password Form */}
        {!loading && isLinkValid && (
          <>
            <div className="logoheader mb-3 text-center">
              <Image
                src="/assets/images/logo.png"
                width={150}
                height={74}
                alt="Logo"
              />
            </div>
            <h3 className="text-center mb-4">Reset Password </h3>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* New Password */}
              <div className="mb-3 position-relative">
                <label className="form-label">New Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control ${errors.password ? " " : ""
                      }`}
                    placeholder="Enter new password"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={togglePasswordVisibility}
                    style={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderColor: errors.password ? "#dc3545" : "#ced4da"
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <small className="invalid-feedback d-block">
                  {errors.password?.message}
                </small>
              </div>

              {/* Confirm Password */}
              <div className="mb-3 position-relative">
                <label className="form-label">Confirm Password</label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`form-control ${errors.confirmPassword ? " " : ""
                      }`}
                    placeholder="Confirm new password"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={toggleConfirmPasswordVisibility}
                    style={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderColor: errors.confirmPassword ? "#dc3545" : "#ced4da"
                    }}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <small className="invalid-feedback d-block">
                  {errors.confirmPassword?.message}
                </small>
              </div>

              <button
                disabled={isSubmitting}
                className="btn btn-primary w-100"
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;