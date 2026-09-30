import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Dashboard() {
  const { user, token, logout } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const projectId = 1;

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/Dashboard/project/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDashboard(response.data);
      } catch (error) {
        console.error("Dashboard error:", error);

        setError(
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadDashboard();
    }
  }, [token]);

  if (loading) {
    return <h2>Loading dashboard...</h2>;
  }

  if (error) {
    return (
      <div>
        <h2>Dashboard Error</h2>
        <p>{error}</p>

        <button onClick={logout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Task Management Dashboard</h1>

      <h2>
        Welcome, {user?.name}
      </h2>

      <p>
        Email: {user?.email}
      </p>

      <hr />

      <h2>Project Overview</h2>

      <div>
        <h3>Total Tasks</h3>
        <p>{dashboard?.totalTasks ?? 0}</p>
      </div>

      <div>
        <h3>To Do</h3>
        <p>{dashboard?.toDoTasks ?? 0}</p>
      </div>

      <div>
        <h3>In Progress</h3>
        <p>{dashboard?.inProgressTasks ?? 0}</p>
      </div>

      <div>
        <h3>Testing</h3>
        <p>{dashboard?.testingTasks ?? 0}</p>
      </div>

      <div>
        <h3>Done</h3>
        <p>{dashboard?.doneTasks ?? 0}</p>
      </div>

      <hr />

      <h2>Overdue Tasks</h2>

      <p>
        {dashboard?.overdueTasks ?? 0}
      </p>

      <h2>Sprint Progress</h2>

      <p>
        {dashboard?.completedSprintTasks ?? 0}
        {" / "}
        {dashboard?.totalSprintTasks ?? 0}
      </p>

      <p>
        Progress:{" "}
        {dashboard?.sprintProgressPercentage ?? 0}%
      </p>

      <br />

      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;