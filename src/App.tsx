import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import LoginPage from "./pages/common/login/SignIn";
import NotFound from "./pages/NotFound";
import PublicRoute from "./components/AuthGaurd/PublicRoute";
import ProtectedRoute from "./components/AuthGaurd/PublicRoute";
{/* <PublicRoute></PublicRoute> */}
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} /> 
        <Route path="/chat" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> 
        {/* <Route path="/dashboard" element={<Layout>  <Dashboard />  </Layout>} /> */}
         <Route path="*" element={<NotFound/>} /> 
      </Routes>
    </BrowserRouter>
  );
};

export default App;
