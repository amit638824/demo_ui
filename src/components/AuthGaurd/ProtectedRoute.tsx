import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSession } from "../../hooks/useSession";

const ProtectedRoute = ({ children }: any) => {
  const { isLoggedIn} = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  // wait till session is ready
  useEffect(() => {
    
    if (!isLoggedIn) {
      navigate("/", {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [isLoggedIn,  navigate, location.pathname]);

  

  if (!isLoggedIn) return null;

  return children;
};

export default ProtectedRoute;
