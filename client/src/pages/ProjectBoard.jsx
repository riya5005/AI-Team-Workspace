import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import AiBreakdown from "../components/AiBreakdown";

const columns = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
];

export default function ProjectBoard() {
  const { id, projectId } = useParams(); // id is the workspace id
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const p = await api.get(`/workspaces/${id}/projects/${projectId}`);
      const t = await api.get(`/workspaces/${id}/tasks`, {
        params: { project: projectId, limit: 100 },
      });
      setProject(p.data.project);
      setTasks(t.data.tasks);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadData();
    // check for changes from other people every 10 seconds
    const timer = setInterval(loadData, 10000);
    return () => clearInterval(timer);
  }, [id, projectId]);

  async function addTask(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/workspaces/${id}/tasks`, { project: projectId, title, priority });
      setTitle("");
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function changeStatus(taskId, status) {
    try {
      await api.patch(`/workspaces/${id}/tasks/${taskId}`, { status });
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function deleteTask(taskId) {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/workspaces/${id}/tasks/${taskId}`);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (!project) {
    return <div>{error ? <p className="error">{error}</p> : <p>Loading...</p>}</div>;
  }

  return (
    <div>
      <Link to={`/workspaces/${id}`}>← Back to workspace</Link>
      <h2>{project.name}</h2>

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

      {error && <p className="error">{error}</p>}

      <AiBreakdown workspaceId={id} projectId={projectId} onAdded={loadData} />

      <div className="board">
        {columns.map((col) => {
          const items = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="column">
              <h4>
                {col.label} ({items.length})
              </h4>
              {items.map((t) => (
                <div key={t._id} className="task">
                  <strong>{t.title}</strong>
                  <div className="muted">
                    <span className={`badge ${t.priority}`}>{t.priority}</span>{" "}
                    {t.assignee ? t.assignee.username : "Unassigned"}
                  </div>
                  <div className="row" style={{ margin: "8px 0 0" }}>
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
    </div>
  );
}