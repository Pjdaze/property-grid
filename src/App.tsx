import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { Navigation } from "./components/ui/Navigation";
const App = () => {
  return (
    <>
      <Navigation />
      <ProtectedRoute>
        <div className="flex min-h-screen bg-[#fcfdff] container min-w-[1500px] max-w-[1500px]">
          <div className="flex-1 flex justify-center items-center">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </div>
        </div>
      </ProtectedRoute>
    </>
  );
};

export default App;
