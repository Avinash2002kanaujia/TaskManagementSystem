import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav
      style={{
        padding: "15px 25px",
        borderBottom: "1px solid #444",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <h2 style={{ margin: 0 }}>
        Task Management
      </h2>

      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <NavLink to="/dashboard">
          Dashboard
        </NavLink>

        <NavLink to="/teams">
          Teams
        </NavLink>

        <NavLink to="/projects">
          Projects
        </NavLink>

        <NavLink to="/tasks">
          Tasks
        </NavLink>

        <span>
          {user?.name}
        </span>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;