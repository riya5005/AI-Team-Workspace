import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";

export default function ProjectsPanel({ workspaceId }) {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/projects`);
      setProjects(res.data.projects);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, [workspaceId]);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/workspaces/${workspaceId}/projects`, { name });
      setName("");
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <h3>Projects</h3>
      <form onSubmit={handleCreate} className="row">
        <input placeholder="New project name" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit">Create</button>
      </form>
      {error && <p className="error">{error}</p>}
      {projects.length === 0 ? (
        <p className="muted">No projects yet.</p>
      ) : (
        <div className="grid">
          {projects.map((p) => (
            <Link key={p._id} to={`/workspaces/${workspaceId}/projects/${p._id}`} className="card">
              <h3>{p.name}</h3>
              <p className="muted">{p.description || "No description"}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}