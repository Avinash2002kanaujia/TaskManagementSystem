import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getNavClass = ({ isActive }) =>
    `nav-link ${isActive ? "active" : ""}`;

  return (
    <nav className="navbar">

      <div className="navbar-inner">

        {/* Brand */}
        <NavLink to="/dashboard" className="navbar-brand">
          <div className="brand-icon">
            ✓
          </div>

          <div>
            <strong>TaskFlow</strong>
            <span>Management</span>
          </div>
        </NavLink>


        {/* Navigation */}
        <div className="navbar-links">

          <NavLink
            to="/dashboard"
            className={getNavClass}
          >
            <span>▦</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/teams"
            className={getNavClass}
          >
            <span>♟</span>
            Teams
          </NavLink>

          <NavLink
            to="/projects"
            className={getNavClass}
          >
            <span>▣</span>
            Projects
          </NavLink>

          <NavLink
            to="/tasks"
            className={getNavClass}
          >
            <span>☷</span>
            Tasks
          </NavLink>

        </div>


        {/* User */}
        <div className="navbar-user">

          <div className="navbar-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="navbar-user-info">
            <strong>{user?.name}</strong>
            <span>Team Member</span>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            ↪
          </button>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;