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
    return (
      <div className="page-container">
        <div className="loading-card">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-card">
          <div className="error-icon">!</div>
          <h2>Dashboard Error</h2>
          <p>{error}</p>

          <button className="btn btn-danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  const totalTasks = dashboard?.totalTasks ?? 0;
  const toDoTasks = dashboard?.toDoTasks ?? 0;
  const inProgressTasks = dashboard?.inProgressTasks ?? 0;
  const testingTasks = dashboard?.testingTasks ?? 0;
  const doneTasks = dashboard?.doneTasks ?? 0;
  const overdueTasks = dashboard?.overdueTasks ?? 0;
  const completedSprintTasks =
    dashboard?.completedSprintTasks ?? 0;
  const totalSprintTasks =
    dashboard?.totalSprintTasks ?? 0;
  const sprintProgress =
    dashboard?.sprintProgressPercentage ?? 0;

  return (
    <div className="page-container dashboard-page">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <p className="page-eyebrow">PROJECT OVERVIEW</p>

          <h1>Dashboard</h1>

          <p className="page-subtitle">
            Welcome back, {user?.name}. Here's what's happening
            with your project.
          </p>
        </div>

        <div className="user-card">
          <div className="avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div>
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">

        <div className="stat-card stat-blue">
          <div className="stat-icon">📋</div>

          <div>
            <span>Total Tasks</span>
            <strong>{totalTasks}</strong>
          </div>
        </div>

        <div className="stat-card stat-yellow">
          <div className="stat-icon">○</div>

          <div>
            <span>To Do</span>
            <strong>{toDoTasks}</strong>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-icon">◐</div>

          <div>
            <span>In Progress</span>
            <strong>{inProgressTasks}</strong>
          </div>
        </div>

        <div className="stat-card stat-orange">
          <div className="stat-icon">◒</div>

          <div>
            <span>Testing</span>
            <strong>{testingTasks}</strong>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-icon">✓</div>

          <div>
            <span>Completed</span>
            <strong>{doneTasks}</strong>
          </div>
        </div>

        <div className="stat-card stat-red">
          <div className="stat-icon">!</div>

          <div>
            <span>Overdue</span>
            <strong>{overdueTasks}</strong>
          </div>
        </div>

      </div>

      {/* Main Dashboard */}
      <div className="dashboard-content">

        {/* Task Distribution */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Task Distribution</h2>
              <p>Current project task status</p>
            </div>
          </div>

          <div className="task-distribution">

            <div className="distribution-row">
              <div className="distribution-label">
                <span className="status-dot todo"></span>
                <span>To Do</span>
              </div>

              <strong>{toDoTasks}</strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill todo-fill"
                style={{
                  width: `${
                    totalTasks
                      ? (toDoTasks / totalTasks) * 100
                      : 0
                  }%`,
                }}
              />
            </div>


            <div className="distribution-row">
              <div className="distribution-label">
                <span className="status-dot progress"></span>
                <span>In Progress</span>
              </div>

              <strong>{inProgressTasks}</strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill progress-fill-purple"
                style={{
                  width: `${
                    totalTasks
                      ? (inProgressTasks / totalTasks) * 100
                      : 0
                  }%`,
                }}
              />
            </div>


            <div className="distribution-row">
              <div className="distribution-label">
                <span className="status-dot testing"></span>
                <span>Testing</span>
              </div>

              <strong>{testingTasks}</strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill progress-fill-orange"
                style={{
                  width: `${
                    totalTasks
                      ? (testingTasks / totalTasks) * 100
                      : 0
                  }%`,
                }}
              />
            </div>


            <div className="distribution-row">
              <div className="distribution-label">
                <span className="status-dot done"></span>
                <span>Done</span>
              </div>

              <strong>{doneTasks}</strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill progress-fill-green"
                style={{
                  width: `${
                    totalTasks
                      ? (doneTasks / totalTasks) * 100
                      : 0
                  }%`,
                }}
              />
            </div>

          </div>
        </div>


        {/* Sprint */}
        <div className="dashboard-card sprint-card">

          <div className="card-header">
            <div>
              <h2>Sprint Progress</h2>
              <p>Current sprint completion</p>
            </div>

            <div className="sprint-percentage">
              {sprintProgress}%
            </div>
          </div>

          <div className="sprint-circle-container">
            <div
              className="sprint-circle"
              style={{
                "--progress": `${sprintProgress}%`,
              }}
            >
              <div className="sprint-circle-inner">
                <strong>{sprintProgress}%</strong>
                <span>Complete</span>
              </div>
            </div>
          </div>

          <div className="sprint-summary">
            <div>
              <strong>{completedSprintTasks}</strong>
              <span>Completed</span>
            </div>

            <div>
              <strong>{totalSprintTasks}</strong>
              <span>Total Tasks</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;