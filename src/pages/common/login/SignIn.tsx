import { useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
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

      <div className="card shadow-lg loginBox">
        <div className="card-body p-0 auth-header-box">
                                    <div className="text-center p-3">
                                        <a href="index.html" className="logo logo-admin">
                                            <img src="assets/images/logo.png" height="60" alt="logo" className="auth-logo" />
                                        </a>
                                        <h4 className="mt-3 mb-1 fw-semibold text-white font-18">Let's Get Started</h4>   
                                        <p className="text-muted  mb-0">Sign in to continue to AI Sync.</p>  
                                    </div>
                                </div>
        

        <div className="card-body pt-0">                                    
                                    <form className="my-4" action="#">            
                                        <div className="form-group mb-2">
                                            <label className="form-label" for="username">Username</label>
                                            <input type="text" className="form-control" id="username" name="username" placeholder="Enter username" />                               
                                        </div>
            
                                        <div className="form-group">
                                            <label className="form-label" for="userpassword">Password</label>                                            
                                            <input type="password" className="form-control" name="password" id="userpassword" placeholder="Enter password" />                            
                                        </div>
            
                                        <div className="form-group row mt-3">
                                            <div className="col-sm-6">
                                                <div className="form-check form-switch form-switch-success">
                                                    <input className="form-check-input" type="checkbox" id="customSwitchSuccess" />
                                                    <label className="form-check-label" for="customSwitchSuccess">Remember me</label>
                                                </div>
                                            </div>
                                            <div className="col-sm-6 text-end">
                                                <Link to="" className="text-muted font-13"><i className="dripicons-lock"></i> Forgot password?</Link>                                    
                                            </div>
                                        </div>
            
                                        <div className="form-group mb-0 row">
                                            <div className="col-12">
                                                <div className="d-grid mt-3 loginbtn">
                                                    <button className="btn btn-primary" type="button">Log In</button>
                                                </div>
                                            </div>
                                        </div>                           
                                    </form>
                                    <div className="m-3 text-center text-muted">
                                        <p className="mb-0">Don't have an account ?  <a href="#" className="text-primary ms-2">Resister Here</a></p>
                                    </div>
                                    
                                    
                                    
                                </div>
      </div>
    </div>
  );
};

export default LoginPage;
