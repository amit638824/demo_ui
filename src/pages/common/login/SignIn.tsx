import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";

import Loader from "../../../components/loader/Loader";
import { login } from "../../../redux/slice/authSlice";
import { loginService } from "../../../services/AuthServices";

/* ================= VALIDATION ================= */
const schema = Yup.object({
  email: Yup.string()
    .email("Enter valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const STORAGE_KEY = "remember_login_full";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  /* ================= LOAD REMEMBERED DATA ================= */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setValue("email", parsed.email);
      setValue("password", parsed.password);
      setValue("rememberMe", true);
    }
  }, [setValue]);

  /* ================= LOGIN ================= */
  const onSubmit = async (formData: LoginFormData) => {
    try {
      setLoading(true);

      const res = await loginService({
        email: formData.email,
        password: formData.password,
      });

      // API-level error
      if (!res?.success) {
        toast.error(res?.message || "Login failed");
        return;
      }

      const { token, email } = res.data;
      localStorage.setItem("token", token)
      // Redux store
      dispatch(
        login({
          token,
          user: { email },
        } as any)
      );

      /* ================= REMEMBER ME ================= */
      if (formData.rememberMe) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            email: formData.email,
            password: formData.password, // ⚠️ stored intentionally
            token,
          })
        );
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }

      toast.success("Login successful");
      navigate("/chat", { replace: true });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Server error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-themebg">
      {loading && <Loader />}

      <div className="card shadow-lg loginBox">
        {/* HEADER */}
        <div className="card-body p-0 auth-header-box">
          <div className="text-center p-3">
            <img
              src="assets/images/logo.png"
              height="60"
              alt="logo"
            />
            <h4 className="mt-3 mb-1 fw-semibold text-white">
              Let's Get Started
            </h4>
            <p className="text-muted mb-0">
              Sign in to continue.
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="card-body pt-0">
          <form className="my-4" onSubmit={handleSubmit(onSubmit)}>
            {/* EMAIL */}
            <div className="form-group mb-2">
              <label>Email</label>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""
                  }`}
                placeholder="Enter email"
                {...register("email")}
              />
              {errors.email && (
                <div className="invalid-feedback d-block">
                  {errors.email.message}
                </div>
              )}
            </div>

            {/* PASSWORD */}
            <div className="form-group mb-2 position-relative">
              <label>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control ${errors.password ? "is-invalid" : ""
                  }`}
                placeholder="Enter password"
                {...register("password")}
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "28px",
                  cursor: "pointer",
                }}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>

              {errors.password && (
                <div className="invalid-feedback d-block">
                  {errors.password.message}
                </div>
              )}
            </div>

            {/* REMEMBER ME */}
            <div className="form-group row mt-3">
              <div className="col-sm-6">
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    {...register("rememberMe")}
                  />
                  <label className="form-check-label">
                    Remember me
                  </label>
                </div>
              </div>

              <div className="col-sm-6 text-end">
                <Link to="#" className="text-muted">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* BUTTON */}
            <div className="d-grid mt-3">
              <button className="btn btn-primary" type="submit">
                Log In
              </button>
            </div>
          </form>

          <div className="text-center text-muted mt-3">
            Don't have an account?
            <Link to="#" className="text-primary ms-2">
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
