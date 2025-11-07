import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { Navigation } from "./components/ui/Navigation";
const App = () => {
  return (
    <div className="min-h-screen w-[95%] mx-auto  bg-[#e5ebf0] p-4 rounded-lg m-10">
      <Navigation />
      <ProtectedRoute>
        <div className="flex-1 flex justify-center items-center">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </ProtectedRoute>
    </div>
  );
};

export default App;
