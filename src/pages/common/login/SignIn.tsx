import { useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  /* ================= LOGIN ================= */
  const onSubmit = async (formData: any) => {
    try {
      setLoading(true);

      const res = await loginService(formData);

      if (!res?.success) {
        toast.error(res?.message || "Login failed");
        return;
      }

      const { token, user } = res;

      dispatch(login({ token, user } as any));
      toast.success("Login successful");

      if (Number(user?.user_isProfileCompleted) === 0) {
        navigate("/profile", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      toast.error(err?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-themebg">
      {loading && <Loader />}

      <div className="card p-4 shadow-lg loginBox">
        <div className="text-center mb-3">
          <img src="/assets/images/logo.png" width={150} alt="Logo" />
        </div>

        <h3 className="text-center mb-3">Login</h3>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* EMAIL */}
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
              {...register("email")}
            />
            {errors.email && (
              <div className="text-danger mt-1">
                {errors.email.message}
              </div>
            )}
          </div>

          {/* PASSWORD */}
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              {...register("password")}
            />
            {errors.password && (
              <div className="text-danger mt-1">
                {errors.password.message}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
