import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Projects() {
  const { token } = useAuth();

  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [teamId, setTeamId] = useState("");

  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const teamsResponse = await api.get("/Team", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const loadedTeams = teamsResponse.data;

      setTeams(loadedTeams);

      const projectResponses = await Promise.all(
        loadedTeams.map((team) =>
          api.get(`/Project/team/${team.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );

      const allProjects = projectResponses.flatMap(
        (response) => response.data
      );

      setProjects(allProjects);
    } catch (error) {
      console.error("Projects error:", error);

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    loadData();
  }, [token]);

  const handleCreateProject = async (e) => {
    e.preventDefault();

    if (!projectName.trim() || !teamId) {
      setError("Project name and team are required.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      await api.post(
        `/Project/team/${teamId}`,
        {
          name: projectName,
          description,
          teamId: Number(teamId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProjectName("");
      setDescription("");
      setTeamId("");

      await loadData();
    } catch (error) {
      console.error("Create project error:", error);

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to create project."
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-card">
          <div className="spinner"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container projects-page">

      {/* Header */}
      <div className="page-header">
        <div>
          <p className="page-eyebrow">WORK MANAGEMENT</p>

          <h1>Projects</h1>

          <p className="page-subtitle">
            Organize and manage projects across your teams.
          </p>
        </div>

        <div className="project-count-badge">
          <strong>{projects.length}</strong>
          <span>
            {projects.length === 1 ? "Project" : "Projects"}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">!</span>
          <span>{error}</span>
        </div>
      )}

      {/* Create Project */}
      <section className="project-form-card">

        <div className="form-card-header">
          <div className="form-card-icon project-icon">
            +
          </div>

          <div>
            <h2>Create Project</h2>

            <p>
              Create a project and assign it to a team.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateProject}>

          <div className="project-form-grid">

            <div className="form-group">
              <label htmlFor="projectName">
                Project Name
              </label>

              <input
                id="projectName"
                type="text"
                value={projectName}
                onChange={(e) =>
                  setProjectName(e.target.value)
                }
                placeholder="e.g. Task Management System"
                required
              />
            </div>


            <div className="form-group">
              <label htmlFor="projectTeam">
                Team
              </label>

              <select
                id="projectTeam"
                value={teamId}
                onChange={(e) =>
                  setTeamId(e.target.value)
                }
                required
              >
                <option value="">
                  Select a team
                </option>

                {teams.map((team) => (
                  <option
                    key={team.id}
                    value={team.id}
                  >
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

          </div>


          <div className="form-group">
            <label htmlFor="projectDescription">
              Description
            </label>

            <textarea
              id="projectDescription"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Describe what this project is about..."
              rows="3"
            />
          </div>


          <div className="project-form-footer">

            <span>
              Choose the team responsible for this project.
            </span>

            <button
              className="primary-button project-create-button"
              type="submit"
              disabled={creating}
            >
              {creating ? (
                <>
                  <span className="button-spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <span>+</span>
                  Create Project
                </>
              )}
            </button>

          </div>

        </form>

      </section>


      {/* Projects */}
      <section className="projects-section">

        <div className="section-header">
          <div>
            <h2>My Projects</h2>

            <p>
              Projects available to your teams.
            </p>
          </div>

          <span className="section-count">
            {projects.length}{" "}
            {projects.length === 1
              ? "project"
              : "projects"}
          </span>
        </div>


        {projects.length === 0 ? (
          <div className="empty-state">

            <div className="empty-icon">
              📁
            </div>

            <h3>No projects yet</h3>

            <p>
              Create your first project to get started.
            </p>

          </div>
        ) : (
          <div className="projects-grid">

            {projects.map((project) => {

              const team = teams.find(
                (item) => item.id === project.teamId
              );

              return (
                <div
                  className="project-card"
                  key={project.id}
                >

                  <div className="project-card-top">

                    <div className="project-icon-box">
                      📁
                    </div>

                    <span className="project-id">
                      #{project.id}
                    </span>

                  </div>


                  <h3>{project.name}</h3>

                  <p className="project-description">
                    {project.description ||
                      "No description provided."}
                  </p>


                  <div className="project-team">

                    <div className="small-team-avatar">
                      {team?.name
                        ?.charAt(0)
                        ?.toUpperCase() || "T"}
                    </div>

                    <div>
                      <span>Team</span>

                      <strong>
                        {team?.name ||
                          `Team ${project.teamId}`}
                      </strong>
                    </div>

                  </div>


                  <div className="project-card-footer">

                    <span>
                      Project #{project.id}
                    </span>

                    <button
                      type="button"
                      className="view-project-button"
                    >
                      Open Project →
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </section>

    </div>
  );
}

export default Projects;