import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import AiBreakdown from "../components/AiBreakdown";
import TaskModal from "../components/TaskModal";
import { useToast } from "../context/ToastContext";

const columns = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
];

export default function ProjectBoard() {
  const { id, projectId } = useParams(); // id is the workspace id
  const { showToast } = useToast();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadError, setLoadError] = useState("");

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [overColumn, setOverColumn] = useState(null); // column being dragged over
  const [editingTask, setEditingTask] = useState(null);

  async function loadData() {
    try {
      const p = await api.get(`/workspaces/${id}/projects/${projectId}`);
      const t = await api.get(`/workspaces/${id}/tasks`, {
        params: { project: projectId, limit: 100 },
      });
      setProject(p.data.project);
      setTasks(t.data.tasks);
    } catch (err) {
      setLoadError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadData();
    // check for changes from other people every 10 seconds
    const timer = setInterval(loadData, 10000);
    return () => clearInterval(timer);
  }, [id, projectId]);

  // members are only needed for the assignee dropdown, so load them once
  useEffect(() => {
    api
      .get(`/workspaces/${id}`)
      .then((res) => setMembers(res.data.workspace.members))
      .catch(() => setMembers([]));
  }, [id]);

  async function addTask(e) {
    e.preventDefault();
    try {
      await api.post(`/workspaces/${id}/tasks`, { project: projectId, title, priority });
      setTitle("");
      showToast("Task added");
      loadData();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  }

  async function changeStatus(taskId, status) {
    const oldTasks = tasks;
    // update the screen first so it feels instant
    setTasks(tasks.map((t) => (t._id === taskId ? { ...t, status } : t)));
    try {
      await api.patch(`/workspaces/${id}/tasks/${taskId}`, { status });
      showToast("Task moved");
    } catch (err) {
      setTasks(oldTasks); // put it back if the server said no
      showToast(getErrorMessage(err), "error");
    }
  }

  async function saveTask(taskId, updates) {
    try {
      await api.patch(`/workspaces/${id}/tasks/${taskId}`, updates);
      showToast("Task updated");
      setEditingTask(null);
      loadData();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  }

  async function deleteTask(taskId) {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/workspaces/${id}/tasks/${taskId}`);
      showToast("Task deleted");
      loadData();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  }

  // drag and drop
  function handleDragStart(e, taskId) {
    e.dataTransfer.setData("text/plain", taskId);
  }

  function handleDrop(e, columnKey) {
    e.preventDefault();
    setOverColumn(null);
    const taskId = e.dataTransfer.getData("text/plain");
    const task = tasks.find((t) => t._id === taskId);
    if (task && task.status !== columnKey) {
      changeStatus(taskId, columnKey);
    }
  }

  if (!project) {
    return <div>{loadError ? <p className="error">{loadError}</p> : <p>Loading...</p>}</div>;
  }

  // apply search and priority filter
  const visibleTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const percent = tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);

  return (
    <div>
      <Link to={`/workspaces/${id}`}>← Back to workspace</Link>
      <h2>{project.name}</h2>

      <div className="progress-wrap">
        <div className="progress-bar" style={{ width: `${percent}%` }} />
      </div>
      <p className="muted">
        {doneCount} of {tasks.length} tasks done ({percent}%)
      </p>

      <form onSubmit={addTask} className="row">
        <input
          placeholder="New task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
        <button type="submit">Add task</button>
      </form>

      <AiBreakdown workspaceId={id} projectId={projectId} onAdded={loadData} />

      <div className="row">
        <input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="board">
        {columns.map((col) => {
          const items = visibleTasks.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              className={`column ${overColumn === col.key ? "drag-over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault(); // needed so dropping is allowed
                setOverColumn(col.key);
              }}
              onDragLeave={() => setOverColumn(null)}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              <h4>
                {col.label} ({items.length})
              </h4>

              {items.length === 0 && <p className="muted">Drop tasks here</p>}

              {items.map((t) => (
                <div
                  key={t._id}
                  className="task"
                  draggable
                  onDragStart={(e) => handleDragStart(e, t._id)}
                  onClick={() => setEditingTask(t)}
                >
                  <strong>{t.title}</strong>
                  <div className="muted">
                    <span className={`badge ${t.priority}`}>{t.priority}</span>{" "}
                    {t.assignee ? t.assignee.username : "Unassigned"}
                    {t.dueDate && <> · due {new Date(t.dueDate).toLocaleDateString()}</>}
                  </div>
                  <div
                    className="row"
                    style={{ margin: "8px 0 0" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select value={t.status} onChange={(e) => changeStatus(t._id, e.target.value)}>
                      {columns.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <button className="btn-danger" onClick={() => deleteTask(t._id)}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {editingTask && (
        <TaskModal
          task={editingTask}
          members={members}
          onClose={() => setEditingTask(null)}
          onSave={saveTask}
        />
      )}
    </div>
  );
}