import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Teams() {
  const { token } = useAuth();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [userId, setUserId] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [memberMessage, setMemberMessage] = useState("");

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/Team", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTeams(response.data);
    } catch (error) {
      console.error("Teams error:", error);

      setError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to load teams."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadTeams();
    }
  }, [token]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    try {
      setCreating(true);
      setError("");

      await api.post(
        "/Team",
        {
          name: teamName,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTeamName("");
      setDescription("");

      await loadTeams();
    } catch (error) {
      console.error("Create team error:", error);

      setError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to create team."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!selectedTeamId || !userId) {
      setMemberMessage("Please select a team and enter a user ID.");
      return;
    }

    try {
      setAddingMember(true);
      setMemberMessage("");
      setError("");

      await api.post(
        `/Team/${selectedTeamId}/members`,
        {
          userId: Number(userId),
          role: 1
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMemberMessage(
        `User ${userId} added successfully.`
      );

      setUserId("");
    } catch (error) {
      console.error("Add member error:", error);

      setMemberMessage(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to add member."
      );
    } finally {
      setAddingMember(false);
    }
  };

  if (loading) {
    return <h2>Loading teams...</h2>;
  }

  return (
    <div>
      <h1>Teams</h1>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {/* Create Team */}
      <section>
        <h2>Create Team</h2>

        <form onSubmit={handleCreateTeam}>
          <div>
            <label>Team Name</label>
            <br />

            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              required
            />
          </div>

          <br />

          <div>
            <label>Description</label>
            <br />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter team description"
              rows="4"
            />
          </div>

          <br />

          <button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create Team"}
          </button>
        </form>
      </section>

      <hr />

      {/* Add Member */}
      <section>
        <h2>Add Team Member</h2>

        <form onSubmit={handleAddMember}>
          <div>
            <label>Select Team</label>
            <br />

            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
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
                  {team.name} (ID: {team.id})
                </option>
              ))}
            </select>
          </div>

          <br />

          <div>
            <label>User ID</label>
            <br />

            <input
              type="number"
              min="1"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              required
            />
          </div>

          <br />

          <button
            type="submit"
            disabled={addingMember}
          >
            {addingMember
              ? "Adding..."
              : "Add Member"}
          </button>
        </form>

        {memberMessage && (
          <p>{memberMessage}</p>
        )}
      </section>

      <hr />

      {/* Teams */}
      <section>
        <h2>My Teams</h2>

        {teams.length === 0 ? (
          <p>No teams found.</p>
        ) : (
          <ul>
            {teams.map((team) => (
              <li key={team.id}>
                <h3>{team.name}</h3>

                <p>
                  {team.description || "No description"}
                </p>

                <p>
                  Team ID: {team.id}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Teams;