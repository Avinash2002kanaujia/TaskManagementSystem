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
  const [memberMessageType, setMemberMessageType] = useState("");

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
      setMemberMessage(
        "Please select a team and enter a user ID."
      );
      setMemberMessageType("error");
      return;
    }

    try {
      setAddingMember(true);
      setMemberMessage("");
      setMemberMessageType("");
      setError("");

      await api.post(
        `/Team/${selectedTeamId}/members`,
        {
          userId: Number(userId),
          role: 1,
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
      setMemberMessageType("success");

      setUserId("");

      await loadTeams();
    } catch (error) {
      console.error("Add member error:", error);

      setMemberMessage(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to add member."
      );
      setMemberMessageType("error");
    } finally {
      setAddingMember(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-card">
          <div className="spinner"></div>
          <p>Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container teams-page">

      {/* Header */}
      <div className="page-header">
        <div>
          <p className="page-eyebrow">COLLABORATION</p>

          <h1>Teams</h1>

          <p className="page-subtitle">
            Manage your teams and collaborate with your
            members.
          </p>
        </div>

        <div className="team-count-badge">
          <strong>{teams.length}</strong>
          <span>{teams.length === 1 ? "Team" : "Teams"}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">!</span>
          <span>{error}</span>
        </div>
      )}

      {/* Top Actions */}
      <div className="team-actions-grid">

        {/* Create Team */}
        <section className="form-card">

          <div className="form-card-header">
            <div className="form-card-icon create-icon">
              +
            </div>

            <div>
              <h2>Create Team</h2>
              <p>
                Create a new team for your project.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateTeam}>

            <div className="form-group">
              <label htmlFor="teamName">
                Team Name
              </label>

              <input
                id="teamName"
                type="text"
                value={teamName}
                onChange={(e) =>
                  setTeamName(e.target.value)
                }
                placeholder="e.g. Backend Team"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="teamDescription">
                Description
              </label>

              <textarea
                id="teamDescription"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="What is this team responsible for?"
                rows="4"
              />
            </div>

            <button
              className="primary-button"
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
                  Create Team
                </>
              )}
            </button>

          </form>
        </section>


        {/* Add Member */}
        <section className="form-card">

          <div className="form-card-header">
            <div className="form-card-icon member-icon">
              +
            </div>

            <div>
              <h2>Add Member</h2>
              <p>
                Add a user to one of your teams.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddMember}>

            <div className="form-group">
              <label htmlFor="selectedTeam">
                Select Team
              </label>

              <select
                id="selectedTeam"
                value={selectedTeamId}
                onChange={(e) =>
                  setSelectedTeamId(e.target.value)
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


            <div className="form-group">
              <label htmlFor="userId">
                User ID
              </label>

              <input
                id="userId"
                type="number"
                min="1"
                value={userId}
                onChange={(e) =>
                  setUserId(e.target.value)
                }
                placeholder="Enter user ID"
                required
              />

              <span className="field-help">
                Enter the ID of the user you want to
                add.
              </span>
            </div>


            <button
              className="secondary-button"
              type="submit"
              disabled={addingMember}
            >
              {addingMember ? (
                <>
                  <span className="button-spinner"></span>
                  Adding...
                </>
              ) : (
                <>
                  <span>+</span>
                  Add Member
                </>
              )}
            </button>

          </form>


          {memberMessage && (
            <div
              className={`member-message ${
                memberMessageType === "success"
                  ? "message-success"
                  : "message-error"
              }`}
            >
              <span>
                {memberMessageType === "success"
                  ? "✓"
                  : "!"}
              </span>

              {memberMessage}
            </div>
          )}

        </section>

      </div>


      {/* Teams */}
      <section className="teams-section">

        <div className="section-header">
          <div>
            <h2>My Teams</h2>
            <p>
              Teams you're currently a member of.
            </p>
          </div>

          <span className="section-count">
            {teams.length}{" "}
            {teams.length === 1 ? "team" : "teams"}
          </span>
        </div>


        {teams.length === 0 ? (
          <div className="empty-state">

            <div className="empty-icon">
              👥
            </div>

            <h3>No teams yet</h3>

            <p>
              Create your first team to start
              collaborating.
            </p>

          </div>
        ) : (
          <div className="teams-grid">

            {teams.map((team) => {

              const members = team.members || [];

              return (
                <div
                  className="team-card"
                  key={team.id}
                >

                  {/* Team header */}
                  <div className="team-card-header">

                    <div className="team-avatar">
                      {team.name
                        ?.charAt(0)
                        ?.toUpperCase() || "T"}
                    </div>

                    <div className="team-title">

                      <h3>{team.name}</h3>

                      <span>
                        Team #{team.id}
                      </span>

                    </div>

                    <div className="team-menu">
                      •••
                    </div>

                  </div>


                  {/* Description */}
                  <p className="team-description">
                    {team.description ||
                      "No description provided."}
                  </p>


                  {/* Members */}
                  <div className="team-members-section">

                    <div className="members-header">
                      <span>Members</span>

                      <strong>
                        {members.length}
                      </strong>
                    </div>


                    {members.length > 0 ? (
                      <div className="member-list">

                        {members
                          .slice(0, 5)
                          .map((member) => (
                            <div
                              className="member-row"
                              key={member.userId}
                            >

                              <div className="member-avatar">
                                {member.name
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                  "U"}
                              </div>

                              <div className="member-info">
                                <strong>
                                  {member.name}
                                </strong>

                                <span>
                                  {member.email}
                                </span>
                              </div>

                              <span
                                className={`role-badge ${
                                  member.role === 2
                                    ? "role-admin"
                                    : "role-member"
                                }`}
                              >
                                {member.role === 2
                                  ? "Admin"
                                  : "Member"}
                              </span>

                            </div>
                          ))}

                      </div>
                    ) : (
                      <p className="no-members">
                        No members found.
                      </p>
                    )}

                  </div>


                  {/* Footer */}
                  <div className="team-card-footer">

                    <span>
                      {members.length}{" "}
                      {members.length === 1
                        ? "member"
                        : "members"}
                    </span>

                    <button
                      type="button"
                      className="view-team-button"
                      onClick={() =>
                        setSelectedTeamId(
                          String(team.id)
                        )
                      }
                    >
                      Select Team →
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

export default Teams;