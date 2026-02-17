"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { FaRegEyeSlash } from "react-icons/fa";
import PasswordChecklist from "react-password-checklist";

import { recruiterRegistrationService } from "@/services/AuthServices";
import { showAlert } from "@/utils/swalFire"; 
import Loader from "../loader/Loader";
import { useRouter } from "next/navigation";
/* ---------------- VALIDATION ---------------- */
const schema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Minimum 8 characters")
    .required("Password is required"),
});

const RecruiterRegistration = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
 const [isPasswordValid, setIsPasswordValid] = useState(false);
 const router=useRouter()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

const password = useWatch({
        control,
        name: "password",
    });
 
    useEffect(() => {
        if (!password) {
            setIsPasswordValid(false);
        }
    }, [password]);
  /* ---------------- SUBMIT ---------------- */
  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      const payload = {
        ...data,
        rememberMe,
      };

      const res = await recruiterRegistrationService(payload);

      if (!res?.success) {
        return showAlert("error", res?.message, "Failed");
      }

      showAlert("success", res?.message, "Success");
      router.push("/")
    } catch (error: any) {
      showAlert(
        "error",
        error?.response?.data?.message || "Something went wrong",
        "Error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-themebg">
      {loading && <Loader />}

      <div className="card p-4 shadow-lg loginBox">
        <div className="logoheader mb-3 text-center">
          <Image
            src="/assets/images/logo.png"
            width={150}
            height={74}
            alt="Logo"
          />
        </div>

        <h3 className="text-center mb-4">
          Recruiter Registration
        </h3>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* EMAIL */}
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className={`form-control ${errors.email ? " " : ""}`}
              // placeholder="Enter your email"
              {...register("email")}
            />
            {errors.email && (
              <div className="invalid-feedback">
                {errors.email.message}
              </div>
            )}
          </div>

          {/* PASSWORD */}
           <div className="mb-3 position-relative">
                        <label className="form-label">
                            Password
                        </label>
                        <span className="eyeComponent">
                            <input
                                type={showPassword ? "text" : "password"}
                                className={`form-control ${errors.password ? " " : ""
                                    }`}
                                placeholder=""
                                {...register("password")}
                            />
                            <span
                                className="eyeicon"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {!errors.password && (
                                    showPassword ? (
                                        <MdOutlineRemoveRedEye />
                                    ) : (
                                        <FaRegEyeSlash />
                                    )
                                )}

                            </span>
                        </span>

                        {errors.password && (
                            <div className="invalid-feedback">
                                {errors.password.message}
                            </div>
                        )}

                        {password && (
                            <div
                                className="passwordValidation"
                                style={{
                                    display: isPasswordValid ? "none" : "block",
                                }}
                            >
                                <PasswordChecklist
                                    rules={[
                                        "minLength",
                                        "lowercase",
                                        "capital",
                                        "number",
                                        "specialChar",
                                    ]}
                                    minLength={8}
                                    value={password}
                                    onChange={(isValid) => setIsPasswordValid(isValid)}
                                    messages={{
                                        minLength: "Minimum 8 characters",
                                        lowercase: "One lowercase letter",
                                        capital: "One uppercase letter",
                                        number: "One number",
                                        specialChar: "One special character",
                                    }}
                                />
                            </div>
                        )}
                    </div>

          {/* REMEMBER ME */}
          <div className="d-flex justify-content-between mb-3"> 
           
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            Register
          </button>
        </form>

        <div className="text-center mt-3">
          <p>
            Already have an account?{" "}
            <Link href="/" className="themeBlue">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecruiterRegistration;
