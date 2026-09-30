import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const STATUS = {
  1: "To Do",
  2: "In Progress",
  3: "Testing",
  4: "Done",
};

const PRIORITY = {
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Critical",
};

function Tasks() {
  const { token } = useAuth();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [tasks, setTasks] = useState([]);

  // New: sprints and team members
  const [sprints, setSprints] = useState([]);
  const [members, setMembers] = useState([]);

  const [selectedSprintId, setSelectedSprintId] = useState("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [priority, setPriority] = useState(2);
  const [dueDate, setDueDate] = useState("");

  const [creating, setCreating] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
const [aiSubtasks, setAiSubtasks] = useState([]);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  // -----------------------------------------
  // Load projects
  // -----------------------------------------
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const teamsResponse = await api.get("/Team", {
        headers: authHeaders,
      });

      const teams = teamsResponse.data;

      const projectResponses = await Promise.all(
        teams.map((team) =>
          api.get(`/Project/team/${team.id}`, {
            headers: authHeaders,
          })
        )
      );

      const allProjects = projectResponses.flatMap(
        (response) => response.data
      );

      setProjects(allProjects);

      if (allProjects.length > 0) {
        setSelectedProjectId(String(allProjects[0].id));
      }
    } catch (error) {
      console.error("Load projects error:", error);

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // Load tasks
  // -----------------------------------------
  const loadTasks = async (projectId) => {
    if (!projectId) {
      setTasks([]);
      return;
    }

    try {
      setLoadingTasks(true);
      setError("");

      const response = await api.get(
        `/Task/project/${projectId}`,
        {
          headers: authHeaders,
        }
      );

      setTasks(response.data);
    } catch (error) {
      console.error("Load tasks error:", error);

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load tasks."
      );

      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  // -----------------------------------------
  // Load sprints + team members
  // -----------------------------------------
  const loadTaskOptions = async (projectId) => {
    if (!projectId) {
      setSprints([]);
      setMembers([]);
      return;
    }

    try {
      setLoadingOptions(true);
      setError("");

      const project = projects.find(
        (p) => String(p.id) === String(projectId)
      );

      if (!project) {
        return;
      }

      // -----------------------------
      // Load sprints
      // -----------------------------
      const sprintResponse = await api.get(
        `/Sprint/project/${projectId}`,
        {
          headers: authHeaders,
        }
      );

      const loadedSprints = sprintResponse.data || [];

      setSprints(loadedSprints);

      // Automatically select active sprint if available
      const activeSprint = loadedSprints.find(
        (sprint) => sprint.isActive === true
      );

      if (activeSprint) {
        setSelectedSprintId(String(activeSprint.id));
      } else {
        setSelectedSprintId("");
      }

      // -----------------------------
      // Load team members
      // -----------------------------
      const teamResponse = await api.get(
        `/Team/${project.teamId}`,
        {
          headers: authHeaders,
        }
      );
      console.log("TEAM RESPONSE:", teamResponse.data);

      const team = teamResponse.data;

      /*
       * Depending on the backend response,
       * members may be returned as:
       *
       * team.members
       *
       * or:
       *
       * team.teamMembers
       */
      const loadedMembers =
        team.members ||
        team.teamMembers ||
        [];

      setMembers(loadedMembers);

      // Reset assignee when project changes
      setSelectedAssigneeId("");
    } catch (error) {
      console.error(
        "Load task options error:",
        error
      );

      setSprints([]);
      setMembers([]);

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load sprints or team members."
      );
    } finally {
      setLoadingOptions(false);
    }
  };

  // -----------------------------------------
  // Initial load
  // -----------------------------------------
  useEffect(() => {
    loadProjects();
  }, []);

  // -----------------------------------------
  // Load tasks + options when project changes
  // -----------------------------------------
  useEffect(() => {
    if (selectedProjectId) {
      loadTasks(selectedProjectId);
      loadTaskOptions(selectedProjectId);
    } else {
      setTasks([]);
      setSprints([]);
      setMembers([]);
    }
  }, [selectedProjectId]);


  // -----------------------------------------
// Generate task details with AI
// -----------------------------------------
const handleGenerateWithAi = async () => {
  if (!title.trim()) {
    setError("Enter a task title first.");
    return;
  }

  try {
    setGeneratingAi(true);
    setError("");
    setAiSubtasks([]);

    const response = await api.post(
      "/Ai/generate-task",
      {
        title: title.trim(),
      },
      {
        headers: authHeaders,
      }
    );

    const result = response.data;

    setDescription(result.description || "");

    setAcceptanceCriteria(
      Array.isArray(result.acceptanceCriteria)
        ? result.acceptanceCriteria.join("\n")
        : result.acceptanceCriteria || ""
    );

    setAiSubtasks(
      Array.isArray(result.subtasks)
        ? result.subtasks
        : []
    );
  } catch (error) {
    console.error("AI generation error:", error);

    setError(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to generate task details with AI."
    );
  } finally {
    setGeneratingAi(false);
  }
};

  // -----------------------------------------
  // Create task
  // -----------------------------------------
  const handleCreateTask = async (e) => {
  e.preventDefault();

  if (!selectedProjectId) {
    setError("Please select a project.");
    return;
  }

  if (!title.trim()) {
    setError("Task title is required.");
    return;
  }

  try {
    setCreating(true);
    setError("");

    // -----------------------------------------
    // If AI generated subtasks exist,
    // create task + subtasks together.
    // -----------------------------------------
    if (aiSubtasks.length > 0) {
  const response = await api.post(
    "/Ai/create-task",
    {
      projectId: Number(selectedProjectId),
      title: title.trim(),
      priority: Number(priority),
      dueDate: dueDate
        ? new Date(dueDate).toISOString()
        : null,
      sprintId: selectedSprintId
        ? Number(selectedSprintId)
        : null,
      assigneeId: selectedAssigneeId
        ? Number(selectedAssigneeId)
        : null
    },
    {
      headers: authHeaders
    }
  );

  console.log("AI TASK CREATED:", response.data);
} else {
      // -----------------------------------------
      // Normal task creation
      // -----------------------------------------
      await api.post(
        `/Task/project/${selectedProjectId}`,
        {
          title: title.trim(),
          description: description.trim(),
          acceptanceCriteria:
            acceptanceCriteria.trim(),
          priority: Number(priority),
          dueDate: dueDate
            ? new Date(dueDate).toISOString()
            : null,
          sprintId: sprintId
            ? Number(sprintId)
            : null,
          assigneeId: assigneeId
            ? Number(assigneeId)
            : null
        },
        {
          headers: authHeaders
        }
      );
    }

    // -----------------------------------------
    // Reset form
    // -----------------------------------------
    setTitle("");
    setDescription("");
    setAcceptanceCriteria("");
    setPriority(2);
    setDueDate("");
    setAiSubtasks([]);

    // Refresh task board
    await loadTasks(selectedProjectId);

  } catch (error) {
    console.error(
      "Create task error:",
      error.response?.data || error
    );

    console.error("FULL CREATE TASK ERROR:", error);
console.error("RESPONSE DATA:", error.response?.data);

setError(
  JSON.stringify(
    error.response?.data || error.message
  )
);
  } finally {
    setCreating(false);
  }
};

  // -----------------------------------------
  // Change task status
  // -----------------------------------------
  const handleStatusChange = async (
    taskId,
    newStatus
  ) => {
    try {
      setError("");

      await api.patch(
        `/Task/${taskId}/status`,
        {
          status: Number(newStatus),
        },
        {
          headers: authHeaders,
        }
      );

      await loadTasks(selectedProjectId);
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to update task status."
      );
    }
  };

  // -----------------------------------------
  // Loading
  // -----------------------------------------
  if (loading) {
    return <h2>Loading tasks...</h2>;
  }

  return (
    <div>
      <h1>Tasks</h1>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {/* ---------------------------------- */}
      {/* PROJECT SELECTOR */}
      {/* ---------------------------------- */}

      <section>
        <h2>Select Project</h2>

        <select
          value={selectedProjectId}
          onChange={(e) =>
            setSelectedProjectId(
              e.target.value
            )
          }
        >
          <option value="">
            -- Select Project --
          </option>

          {projects.map((project) => (
            <option
              key={project.id}
              value={project.id}
            >
              {project.name}
            </option>
          ))}
        </select>
      </section>

      <br />

      {/* ---------------------------------- */}
      {/* CREATE TASK */}
      {/* ---------------------------------- */}

      <section>
        <h2>Create Task</h2>

        <form onSubmit={handleCreateTask}>
          {/* TITLE */}

          <div>
  <label>Title</label>
  <br />

  <input
    type="text"
    value={title}
    onChange={(e) =>
      setTitle(e.target.value)
    }
    placeholder="Enter task title"
    required
  />

  <br />
  <br />

  <button
    type="button"
    onClick={handleGenerateWithAi}
    disabled={
      generatingAi ||
      !title.trim()
    }
  >
    {generatingAi
      ? "Generating..."
      : "✨ Generate with AI"}
  </button>
</div>

          <br />

          {/* DESCRIPTION */}

          <div>
            <label>Description</label>
            <br />

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Enter task description"
              rows="4"
            />
          </div>

          <br />

          {/* ACCEPTANCE CRITERIA */}

          <div>
            <label>
              Acceptance Criteria
            </label>
            <br />

            <textarea
              value={acceptanceCriteria}
              onChange={(e) =>
                setAcceptanceCriteria(
                  e.target.value
                )
              }
              placeholder="Enter acceptance criteria"
              rows="4"
            />
          </div>

          <br />

          {/* PRIORITY */}
          {aiSubtasks.length > 0 && (
  <>
    <br />

    <div>
      <h3>✨ AI Generated Subtasks</h3>

      <ul>
        {aiSubtasks.map((subtask, index) => (
          <li key={index}>
            {subtask}
          </li>
        ))}
      </ul>
    </div>
  </>
)}

<br />

{/* PRIORITY */}

          <div>
            <label>Priority</label>
            <br />

            <select
              value={priority}
              onChange={(e) =>
                setPriority(
                  Number(e.target.value)
                )
              }
            >
              <option value={1}>
                Low
              </option>

              <option value={2}>
                Medium
              </option>

              <option value={3}>
                High
              </option>

              <option value={4}>
                Critical
              </option>
            </select>
          </div>

          <br />

          {/* SPRINT */}

          <div>
            <label>Sprint</label>
            <br />

            <select
              value={selectedSprintId}
              onChange={(e) =>
                setSelectedSprintId(
                  e.target.value
                )
              }
              disabled={
                loadingOptions ||
                !selectedProjectId
              }
            >
              <option value="">
                -- No Sprint --
              </option>

              {sprints.map((sprint) => (
                <option
                  key={sprint.id}
                  value={sprint.id}
                >
                  {sprint.name}
                  {sprint.isActive
                    ? " (Active)"
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <br />

          {/* ASSIGNEE */}

          <div>
            <label>Assignee</label>
            <br />

            <select
              value={selectedAssigneeId}
              onChange={(e) =>
                setSelectedAssigneeId(
                  e.target.value
                )
              }
              disabled={
                loadingOptions ||
                !selectedProjectId
              }
            >
              <option value="">
                -- Unassigned --
              </option>

              {members.map((member) => {
                /*
                 * Support different possible
                 * backend member shapes.
                 */

                const userId =
                  member.userId ??
                  member.id;

                const userName =
                  member.user?.name ??
                  member.name ??
                  `User ${userId}`;

                const userEmail =
                  member.user?.email ??
                  member.email ??
                  "";

                return (
                  <option
                    key={userId}
                    value={userId}
                  >
                    {userName}
                    {userEmail
                      ? ` (${userEmail})`
                      : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <br />

          {/* DUE DATE */}

          <div>
            <label>Due Date</label>
            <br />

            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) =>
                setDueDate(
                  e.target.value
                )
              }
            />
          </div>

          <br />

          <button
            type="submit"
            disabled={
              creating ||
              !selectedProjectId
            }
          >
            {creating
              ? "Creating..."
              : "Create Task"}
          </button>
        </form>
      </section>

      <hr />

      {/* ---------------------------------- */}
      {/* TASK BOARD */}
      {/* ---------------------------------- */}

      <section>
        <h2>Task Board</h2>

        {loadingTasks ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <div>
            {[1, 2, 3, 4].map(
              (status) => {
                const statusTasks =
                  tasks.filter(
                    (task) =>
                      task.status ===
                      status
                  );

                return (
                  <section
                    key={status}
                  >
                    <h3>
                      {STATUS[status]} (
                      {
                        statusTasks.length
                      }
                      )
                    </h3>

                    {statusTasks.length ===
                    0 ? (
                      <p>No tasks.</p>
                    ) : (
                      <ul>
                        {statusTasks.map(
                          (task) => (
                            <li
                              key={
                                task.id
                              }
                            >
                              <h4>
                                {task.title}
                              </h4>

                              <p>
                                {task.description ||
                                  "No description"}
                              </p>

                              <p>
                                Priority:{" "}
                                {PRIORITY[
                                  task
                                    .priority
                                ] ||
                                  task.priority}
                              </p>

                              <p>
                                Status:{" "}
                                {STATUS[
                                  task.status
                                ] ||
                                  task.status}
                              </p>

                              {task.sprintId && (
                                <p>
                                  Sprint ID:{" "}
                                  {
                                    task.sprintId
                                  }
                                </p>
                              )}

                              {task.assigneeId && (
                                <p>
                                  Assignee ID:{" "}
                                  {
                                    task.assigneeId
                                  }
                                </p>
                              )}

                              {task.dueDate && (
                                <p>
                                  Due:{" "}
                                  {new Date(
                                    task.dueDate
                                  ).toLocaleString()}
                                </p>
                              )}

                              <div>
                                <label>
                                  Change
                                  Status:{" "}
                                </label>

                                <select
                                  value={
                                    task.status
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    handleStatusChange(
                                      task.id,
                                      e.target
                                        .value
                                    )
                                  }
                                >
                                  <option value={1}>
                                    To Do
                                  </option>

                                  <option value={2}>
                                    In Progress
                                  </option>

                                  <option value={3}>
                                    Testing
                                  </option>

                                  <option value={4}>
                                    Done
                                  </option>
                                </select>
                              </div>

                              <hr />
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </section>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Tasks;