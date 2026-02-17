import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import LoginPage from "./pages/common/login/SignIn";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} /> 
        <Route path="/chat" element={<Dashboard />} /> 
        {/* <Route path="/dashboard" element={<Layout>  <Dashboard />  </Layout>} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
