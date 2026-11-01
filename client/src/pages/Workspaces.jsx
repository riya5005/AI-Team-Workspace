import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await api.get("/workspaces");
      setWorkspaces(res.data.workspaces);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/workspaces", { name });
      setName("");
      load(); // refresh the list
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <h2>Your workspaces</h2>

      <form onSubmit={handleCreate} className="row">
        <input placeholder="New workspace name" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit">Create</button>
      </form>
      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : workspaces.length === 0 ? (
        <p className="muted">No workspaces yet. Create your first one above.</p>
      ) : (
        <div className="grid">
          {workspaces.map((w) => (
            <Link key={w.id} to={`/workspaces/${w.id}`} className="card">
              <h3>{w.name}</h3>
              <p className="muted">{w.memberCount} member(s)</p>
              <span className={`badge ${w.myRole}`}>{w.myRole}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}