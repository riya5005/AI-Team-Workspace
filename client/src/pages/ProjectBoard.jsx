import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";

const COLUMNS = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
];

export default function ProjectBoard() {
  const { id, projectId } = useParams(); // id = workspace id
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [error, setError] = useState("");

  async function load() {
    try {
      const [p, t] = await Promise.all([
        api.get(`/workspaces/${id}/projects/${projectId}`),
        api.get(`/workspaces/${id}/tasks`, { params: { project: projectId, limit: 100 } }),
      ]);
      setProject(p.data.project);
      setTasks(t.data.tasks);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, [id, projectId]);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/workspaces/${id}/tasks`, { project: projectId, title, priority });
      setTitle("");
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function changeStatus(taskId, status) {
    setError("");
    try {
      await api.patch(`/workspaces/${id}/tasks/${taskId}`, { status });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function removeTask(taskId) {
    if (!window.confirm("Delete this task?")) return;
    setError("");
    try {
      await api.delete(`/workspaces/${id}/tasks/${taskId}`);
      load();
    } catch (err) {
      setError(getErrorMessage(err)); // e.g. 403 if you didn't create it
    }
  }

  if (!project) return <div>{error ? <p className="error">{error}</p> : <p>Loading...</p>}</div>;

  return (
    <div>
      <Link to={`/workspaces/${id}`}>← Back to workspace</Link>
      <h2>{project.name}</h2>

      <form onSubmit={handleCreate} className="row">
        <input placeholder="New task title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
        <button type="submit">Add task</button>
      </form>
      {error && <p className="error">{error}</p>}

      <div className="board">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="column">
              <h4>{col.label} ({items.length})</h4>
              {items.map((t) => (
                <div key={t._id} className="task">
                  <strong>{t.title}</strong>
                  <div className="muted">
                    <span className={`badge ${t.priority}`}>{t.priority}</span>{" "}
                    {t.assignee?.username || "Unassigned"}
                  </div>
                  <div className="row" style={{ margin: "8px 0 0" }}>
                    <select value={t.status} onChange={(e) => changeStatus(t._id, e.target.value)}>
                      {COLUMNS.map((c) => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                    <button className="btn-danger" onClick={() => removeTask(t._id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}