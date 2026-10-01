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
  const [selectedTask, setSelectedTask] = useState(null);
  useEffect(() => {

}, [selectedTask]);
  const [taskSubtasks, setTaskSubtasks] = useState([]);
const [loadingSubtasks, setLoadingSubtasks] = useState(false);
const [taskComments, setTaskComments] = useState([]);
const [loadingComments, setLoadingComments] = useState(false);
const [commentText, setCommentText] = useState("");
const [addingComment, setAddingComment] = useState(false);
const [taskAttachments, setTaskAttachments] = useState([]);
const [loadingAttachments, setLoadingAttachments] = useState(false);
const [uploadingAttachment, setUploadingAttachment] = useState(false);
const [selectedFile, setSelectedFile] = useState(null);

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
  const loadTaskSubtasks = async (taskId) => {
  try {
    setLoadingSubtasks(true);

    const response = await api.get(
      `/SubTask/task/${taskId}`,
      {
        headers: authHeaders,
      }
    );

    setTaskSubtasks(response.data || []);
  } catch (error) {
    console.error("Load subtasks error:", error);
    setTaskSubtasks([]);
  } finally {
    setLoadingSubtasks(false);
  }
};
const loadTaskComments = async (taskId) => {
  try {
    setLoadingComments(true);

    const response = await api.get(
      `/Comment/task/${taskId}`,
      {
        headers: authHeaders,
      }
    );

    setTaskComments(response.data || []);
  } catch (error) {
    console.error("Load comments error:", error);
    setTaskComments([]);
  } finally {
    setLoadingComments(false);
  }
};
const loadTaskAttachments = async (taskId) => {
  try {
    setLoadingAttachments(true);

    const response = await api.get(
      `/Attachment/task/${taskId}`,
      {
        headers: authHeaders,
      }
    );

    setTaskAttachments(response.data || []);
  } catch (error) {
    console.error("Load attachments error:", error);
    setTaskAttachments([]);
  } finally {
    setLoadingAttachments(false);
  }
};
const handleUploadAttachment = async () => {
  if (!selectedTask || !selectedFile) {
    return;
  }

  try {
    setUploadingAttachment(true);
    setError("");

    const formData = new FormData();

    formData.append("file", selectedFile);

    const response = await api.post(
      `/Attachment/task/${selectedTask.id}`,
      formData,
      {
        headers: {
          ...authHeaders,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setTaskAttachments((current) => [
      ...current,
      response.data,
    ]);

    setSelectedFile(null);

    // Reset file input
    const fileInput = document.getElementById(
      "task-attachment-input"
    );

    if (fileInput) {
      fileInput.value = "";
    }
  } catch (error) {
    console.error("Upload attachment error:", error);

    setError(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to upload attachment."
    );
  } finally {
    setUploadingAttachment(false);
  }
};
const handleDownloadAttachment = async (attachment) => {
  try {
    const response = await api.get(
      `/Attachment/${attachment.id}/download`,
      {
        headers: authHeaders,
        responseType: "blob",
      }
    );

    const blob = new Blob(
      [response.data],
      {
        type:
          response.headers["content-type"] ||
          "application/octet-stream",
      }
    );

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =
      attachment.fileName ||
      attachment.name ||
      "attachment";

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(
      "Download attachment error:",
      error
    );

    setError(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to download attachment."
    );
  }
};
const handleDeleteAttachment = async (attachmentId) => {
  try {
    await api.delete(
      `/Attachment/${attachmentId}`,
      {
        headers: authHeaders,
      }
    );

    setTaskAttachments((current) =>
      current.filter(
        (attachment) =>
          attachment.id !== attachmentId
      )
    );
  } catch (error) {
    console.error(
      "Delete attachment error:",
      error
    );

    setError(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to delete attachment."
    );
  }
};
const handleAddComment = async () => {
  if (!selectedTask || !commentText.trim()) {
    return;
  }

  try {
    setAddingComment(true);

    const response = await api.post(
      `/Comment/task/${selectedTask.id}`,
      {
        content: commentText.trim(),
      },
      {
        headers: authHeaders,
      }
    );

    setTaskComments((current) => [
      ...current,
      response.data,
    ]);

    setCommentText("");
  } catch (error) {
    console.error("Add comment error:", error);

    setError(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to add comment."
    );
  } finally {
    setAddingComment(false);
  }
};

const handleSubtaskToggle = async (subtask) => {
  try {
    const newCompletedState = !subtask.isCompleted;

    // Optimistic UI update
    setTaskSubtasks((current) =>
      current.map((item) =>
        item.id === subtask.id
          ? {
              ...item,
              isCompleted: newCompletedState,
            }
          : item
      )
    );

    await api.patch(
      `/SubTask/${subtask.id}`,
      newCompletedState,
      {
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Update subtask error:", error);

    // Reload from backend if update failed
    if (selectedTask) {
      await loadTaskSubtasks(selectedTask.id);
    }
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
    return (
      <div className="page-container">
        <div className="loading-card">
          <div className="spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  const selectedProject = projects.find(
    (project) =>
      String(project.id) === String(selectedProjectId)
  );

  return (
    <div className="page-container tasks-page">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="tasks-page-header">

        <div>
          <p className="page-eyebrow">
            PROJECT MANAGEMENT
          </p>

          <h1>Tasks</h1>

          <p className="page-subtitle">
            Manage your project tasks and track progress
            across the workflow.
          </p>
        </div>

        <div className="task-summary-badge">
          <strong>{tasks.length}</strong>
          <span>
            {tasks.length === 1 ? "Task" : "Tasks"}
          </span>
        </div>

      </div>


      {/* =========================================
          ERROR
      ========================================= */}

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">!</span>
          <span>{error}</span>
        </div>
      )}


      {/* =========================================
          PROJECT SELECTOR
      ========================================= */}

      <section className="task-project-bar">

        <div className="task-project-info">

          <div className="project-selector-icon">
            📁
          </div>

          <div>
            <span>Current Project</span>

            <strong>
              {selectedProject?.name ||
                "Select a project"}
            </strong>
          </div>

        </div>

        <select
          className="project-select"
          value={selectedProjectId}
          onChange={(e) =>
            setSelectedProjectId(e.target.value)
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


      {/* =========================================
          CREATE TASK
      ========================================= */}

      <section className="task-create-card">

        <div className="task-create-header">

          <div>
            <p className="section-eyebrow">
              NEW TASK
            </p>

            <h2>Create Task</h2>

            <p>
              Add a task to the current project.
            </p>
          </div>

          {selectedProject && (
            <span className="project-name-pill">
              {selectedProject.name}
            </span>
          )}

        </div>


        <form onSubmit={handleCreateTask}>

          {/* Title */}

          <div className="form-group">

            <label htmlFor="taskTitle">
              Task Title
            </label>

            <div className="title-ai-row">

              <input
                id="taskTitle"
                className="task-title-input"
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="e.g. Implement user authentication"
                required
              />

              <button
                type="button"
                className="ai-button"
                onClick={handleGenerateWithAi}
                disabled={
                  generatingAi ||
                  !title.trim()
                }
              >
                {generatingAi ? (
                  <>
                    <span className="button-spinner"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    ✨ Generate with AI
                  </>
                )}
              </button>

            </div>

          </div>


          {/* Description + Acceptance Criteria */}

          <div className="task-form-two-column">

            <div className="form-group">

              <label htmlFor="taskDescription">
                Description
              </label>

              <textarea
                id="taskDescription"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Describe what needs to be done..."
                rows="5"
              />

            </div>


            <div className="form-group">

              <label htmlFor="acceptanceCriteria">
                Acceptance Criteria
              </label>

              <textarea
                id="acceptanceCriteria"
                value={acceptanceCriteria}
                onChange={(e) =>
                  setAcceptanceCriteria(
                    e.target.value
                  )
                }
                placeholder="Enter the conditions that define completion..."
                rows="5"
              />

            </div>

          </div>


          {/* AI Subtasks */}

          {aiSubtasks.length > 0 && (
            <div className="ai-subtasks-card">

              <div className="ai-subtasks-header">

                <div>
                  <span className="ai-sparkle">
                    ✨
                  </span>

                  <strong>
                    AI Generated Subtasks
                  </strong>
                </div>

                <span>
                  {aiSubtasks.length} subtasks
                </span>

              </div>

              <div className="ai-subtask-list">

                {aiSubtasks.map(
                  (subtask, index) => (
                    <div
                      className="ai-subtask-item"
                      key={index}
                    >
                      <span>
                        {index + 1}
                      </span>

                      <p>{subtask}</p>
                    </div>
                  )
                )}

              </div>

            </div>
          )}


          {/* Task options */}

          <div className="task-options-grid">

            {/* Priority */}

            <div className="form-group">

              <label htmlFor="taskPriority">
                Priority
              </label>

              <select
                id="taskPriority"
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


            {/* Sprint */}

            <div className="form-group">

              <label htmlFor="taskSprint">
                Sprint
              </label>

              <select
                id="taskSprint"
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
                  No Sprint
                </option>

                {sprints.map((sprint) => (
                  <option
                    key={sprint.id}
                    value={sprint.id}
                  >
                    {sprint.name}
                    {sprint.isActive
                      ? " • Active"
                      : ""}
                  </option>
                ))}

              </select>

            </div>


            {/* Assignee */}

            <div className="form-group">

              <label htmlFor="taskAssignee">
                Assignee
              </label>

              <select
                id="taskAssignee"
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
                  Unassigned
                </option>

                {members.map((member) => {

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


            {/* Due Date */}

            <div className="form-group">

              <label htmlFor="taskDueDate">
                Due Date
              </label>

              <input
                id="taskDueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) =>
                  setDueDate(e.target.value)
                }
              />

            </div>

          </div>


          {/* Submit */}

          <div className="create-task-footer">

            <span>
              Tasks start in the <strong>To Do</strong>{" "}
              status.
            </span>

            <button
              className="create-task-button"
              type="submit"
              disabled={
                creating ||
                !selectedProjectId
              }
            >
              {creating ? (
                <>
                  <span className="button-spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  + Create Task
                </>
              )}
            </button>

          </div>

        </form>

      </section>


      {/* =========================================
          KANBAN BOARD
      ========================================= */}

      <section className="kanban-section">

        <div className="kanban-header">

          <div>
            <p className="section-eyebrow">
              WORKFLOW
            </p>

            <h2>Task Board</h2>

            <p>
              Move tasks through your development
              workflow.
            </p>
          </div>

          <div className="kanban-total">
            {tasks.length}{" "}
            {tasks.length === 1
              ? "task"
              : "tasks"}
          </div>

        </div>


        {loadingTasks ? (
          <div className="kanban-loading">

            <div className="spinner"></div>

            <p>Loading tasks...</p>

          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">

            <div className="empty-icon">
              📋
            </div>

            <h3>No tasks yet</h3>

            <p>
              Create your first task to start
              managing the project.
            </p>

          </div>
        ) : (
          <div className="kanban-board">

            {[1, 2, 3, 4].map(
              (status) => {

                const statusTasks =
                  tasks.filter(
                    (task) =>
                      task.status === status
                  );

                const statusClass = {
                  1: "kanban-todo",
                  2: "kanban-progress",
                  3: "kanban-testing",
                  4: "kanban-done",
                }[status];

                return (
                  <div
                    className={`kanban-column ${statusClass}`}
                    key={status}
                  >

                    {/* Column header */}

                    <div className="kanban-column-header">

                      <div className="kanban-column-title">

                        <span className="status-dot"></span>

                        <h3>
                          {STATUS[status]}
                        </h3>

                      </div>

                      <span className="kanban-count">
                        {statusTasks.length}
                      </span>

                    </div>


                    {/* Cards */}

                    <div className="kanban-cards">

                      {statusTasks.length === 0 ? (
                        <div className="kanban-empty">
                          <span>+</span>
                          <p>No tasks</p>
                        </div>
                      ) : (
                        statusTasks.map(
                          (task) => {

                            const priorityClass = {
                              1: "priority-low",
                              2: "priority-medium",
                              3: "priority-high",
                              4: "priority-critical",
                            }[
                              task.priority
                            ];

                            return (
                              <article
  key={task.id}
  className="task-card"
onClick={() => {


  setSelectedTask(task);

  // Clear previous task data
  setTaskSubtasks([]);
  setTaskComments([]);
  setTaskAttachments([]);

  // Load selected task data
  loadTaskSubtasks(task.id);
  loadTaskComments(task.id);
  loadTaskAttachments(task.id);
}}
>

                                <div className="task-card-top">

                                  <span
                                    className={`priority-badge ${priorityClass}`}
                                  >
                                    {PRIORITY[
                                      task.priority
                                    ] ||
                                      task.priority}
                                  </span>

                                  <span className="task-id">
                                    #{task.id}
                                  </span>

                                </div>


                                <h4>
                                  {task.title}
                                </h4>


                                <p className="task-card-description">
                                  {task.description ||
                                    "No description provided."}
                                </p>


                                {/* Metadata */}

                                <div className="task-card-meta">

                                  {task.assigneeId && (
                                    <div className="task-meta-item">
                                      <span className="meta-icon">
                                        👤
                                      </span>

                                      <span>
                                        User{" "}
                                        {task.assigneeId}
                                      </span>
                                    </div>
                                  )}

                                  {task.sprintId && (
                                    <div className="task-meta-item">
                                      <span className="meta-icon">
                                        ◫
                                      </span>

                                      <span>
                                        Sprint{" "}
                                        {task.sprintId}
                                      </span>
                                    </div>
                                  )}

                                  {task.dueDate && (
                                    <div className="task-meta-item">
                                      <span className="meta-icon">
                                        📅
                                      </span>

                                      <span>
                                        {new Date(
                                          task.dueDate
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}

                                </div>


                                {/* Status */}

                                <div className="task-card-status">

                                  <label>
                                    Move to
                                  </label>

                                  <select
  value={task.status}
  onClick={(e) => e.stopPropagation()}
  onChange={(e) =>
    handleStatusChange(
      task.id,
      e.target.value
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

                              </article>
                            );
                          }
                        )
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </section>
{selectedTask && (
  <div
  className="task-modal-overlay"
  style={{
    position: "fixed",
    inset: 0,
    zIndex: 99999,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
  onClick={() => setSelectedTask(null)}
>
    <div
  className="task-modal"
  style={{
    position: "relative",
    zIndex: 100000,
    width: "90%",
    maxWidth: "600px",
    maxHeight: "85vh",
    overflowY: "auto",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  }}
  onClick={(e) => e.stopPropagation()}
>
      <div className="task-modal-header">
        <div>
          <span className="task-modal-id">
            TASK #{selectedTask.id}
          </span>

          <h2>{selectedTask.title}</h2>
        </div>

        <button
          className="task-modal-close"
          onClick={() => setSelectedTask(null)}
        >
          ×
        </button>
      </div>

      <div className="task-modal-body">

        <div className="task-detail-section">
          <h3>Description</h3>

          <p>
            {selectedTask.description ||
              "No description provided."}
          </p>
        </div>

        <div className="task-detail-grid">

          <div>
            <span>Priority</span>

            <strong>
              {PRIORITY[selectedTask.priority] ||
                selectedTask.priority}
            </strong>
          </div>

          <div>
            <span>Status</span>

            <strong>
              {STATUS[selectedTask.status] ||
                selectedTask.status}
            </strong>
          </div>

          <div>
            <span>Assignee</span>

            <strong>
              {selectedTask.assigneeId
                ? `User ${selectedTask.assigneeId}`
                : "Unassigned"}
            </strong>
          </div>

          <div>
            <span>Sprint</span>

            <strong>
              {selectedTask.sprintId
                ? `Sprint ${selectedTask.sprintId}`
                : "No Sprint"}
            </strong>
          </div>

        </div>

        {selectedTask.acceptanceCriteria && (
          <div className="task-detail-section">
            <h3>Acceptance Criteria</h3>

            <p>
              {selectedTask.acceptanceCriteria}
            </p>
          </div>
        )}
        {/* Subtasks */}
<div className="task-detail-section">
  <h3>Subtasks</h3>

  {loadingSubtasks ? (
    <p>Loading subtasks...</p>
  ) : taskSubtasks.length === 0 ? (
    <p>No subtasks available.</p>
  ) : (
    <div className="subtask-list">
      {taskSubtasks.map((subtask) => (
  <button
    type="button"
    key={subtask.id}
    className={`subtask-item ${
      subtask.isCompleted ? "completed" : ""
    }`}
    onClick={() => handleSubtaskToggle(subtask)}
  >
    <span className="subtask-checkbox">
      {subtask.isCompleted ? "✓" : ""}
    </span>

    <span className="subtask-title">
      {subtask.title}
    </span>
  </button>
))}
    </div>
  )}
</div>
{/* Comments */}
<div className="task-detail-section comments-section">
  <h3>Comments</h3>

  {loadingComments ? (
    <p>Loading comments...</p>
  ) : taskComments.length === 0 ? (
    <p>No comments yet.</p>
  ) : (
    <div className="comment-list">
      {taskComments.map((comment) => (
        <div
          key={comment.id}
          className="comment-item"
        >
          <div className="comment-header">
            <strong>{comment.userName}</strong>

            <span>
              {new Date(
                comment.createdAt
              ).toLocaleString()}
            </span>
          </div>

          <p>{comment.content}</p>
        </div>
      ))}
    </div>
  )}

  <div className="comment-form">
    <textarea
      value={commentText}
      onChange={(e) =>
        setCommentText(e.target.value)
      }
      placeholder="Write a comment..."
      rows={3}
    />

    <button
      type="button"
      className="comment-submit-button"
      onClick={handleAddComment}
      disabled={
        addingComment || !commentText.trim()
      }
    >
      {addingComment
        ? "Adding..."
        : "Add Comment"}
    </button>
  </div>
</div>

{/* Attachments */}
<div className="task-detail-section attachments-section">
  <h3>Attachments</h3>

  {loadingAttachments ? (
    <p>Loading attachments...</p>
  ) : taskAttachments.length === 0 ? (
    <p>No attachments yet.</p>
  ) : (
    <div className="attachment-list">
      {taskAttachments.map((attachment) => (
        <div
          key={attachment.id}
          className="attachment-item"
        >
          <div className="attachment-info">
            <span className="attachment-icon">
              📎
            </span>

            <div>
              <strong>
                {attachment.fileName ||
                  attachment.name ||
                  "Attachment"}
              </strong>

              {attachment.contentType && (
                <small>
                  {attachment.contentType}
                </small>
              )}
            </div>
          </div>

          <div className="attachment-actions">
            <button
              type="button"
              onClick={() =>
                handleDownloadAttachment(
                  attachment
                )
              }
            >
              Download
            </button>

            <button
              type="button"
              onClick={() =>
                handleDeleteAttachment(
                  attachment.id
                )
              }
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )}

  <div className="attachment-upload">
    <input
      id="task-attachment-input"
      type="file"
      onChange={(e) =>
        setSelectedFile(
          e.target.files?.[0] || null
        )
      }
    />

    <button
      type="button"
      onClick={handleUploadAttachment}
      disabled={
        uploadingAttachment ||
        !selectedFile
      }
    >
      {uploadingAttachment
        ? "Uploading..."
        : "Upload Attachment"}
    </button>
  </div>
</div>

        {selectedTask.dueDate && (
          <div className="task-detail-section">
            <h3>Due Date</h3>

            <p>
              {new Date(
                selectedTask.dueDate
              ).toLocaleString()}
            </p>
          </div>
        )}

      </div>

      <div className="task-modal-footer">

        <button
          className="modal-close-button"
          onClick={() => setSelectedTask(null)}
        >
          Close
        </button>

      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default Tasks;