import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import LoginPage from "./pages/common/login/SignIn";
import Layout from "./components/layout/Layout";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} /> //url changes............
        <Route path="/dashboard" element={<Layout>  <Dashboard />  </Layout>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
