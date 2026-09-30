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

    // First get teams
    const teamsResponse = await api.get("/Team", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const loadedTeams = teamsResponse.data;

    setTeams(loadedTeams);

    // Get projects for each team
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
  console.log("Projects page token:", token);

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
    return <h2>Loading projects...</h2>;
  }

  return (
    <div>
      <h1>Projects</h1>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <section>
        <h2>Create Project</h2>

        <form onSubmit={handleCreateProject}>
          <div>
            <label>Project Name</label>
            <br />

            <input
              type="text"
              value={projectName}
              onChange={(e) =>
                setProjectName(e.target.value)
              }
              placeholder="Enter project name"
              required
            />
          </div>

          <br />

          <div>
            <label>Description</label>
            <br />

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Enter project description"
              rows="4"
            />
          </div>

          <br />

          <div>
            <label>Team</label>
            <br />

            <select
              value={teamId}
              onChange={(e) =>
                setTeamId(e.target.value)
              }
              required
            >
              <option value="">
                -- Select Team --
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

          <br />

          <button
            type="submit"
            disabled={creating}
          >
            {creating
              ? "Creating..."
              : "Create Project"}
          </button>
        </form>
      </section>

      <hr />

      <section>
        <h2>My Projects</h2>

        {projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          <ul>
            {projects.map((project) => (
              <li key={project.id}>
                <h3>{project.name}</h3>

                <p>
                  {project.description ||
                    "No description"}
                </p>

                <p>
                  Project ID: {project.id}
                </p>

                <p>
                  Team ID: {project.teamId}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Projects;