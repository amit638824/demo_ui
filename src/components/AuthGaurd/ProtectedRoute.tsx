import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSession } from "../../hooks/useSession"; 

const ProtectedRoute = ({ children }: any) => {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!session.isLoggedIn) {
      navigate("/", {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [session.isLoggedIn, navigate, location.pathname]);

  if (!session.isLoggedIn) return null;

  return children;
};

export default ProtectedRoute;
