import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Navbar />

      <main
        style={{
          padding: "25px",
        }}
      >
        <Routes>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/teams"
            element={<Teams />}
          />

          <Route
            path="/projects"
            element={<Projects />}
          />

          <Route
            path="/tasks"
            element={<Tasks />}
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
        </Routes>
      </main>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/*"
          element={<ProtectedLayout />}
        />

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;