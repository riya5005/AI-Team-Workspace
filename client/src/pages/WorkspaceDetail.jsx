import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function WorkspaceDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await api.get(`/workspaces/${id}`);
      setWorkspace(res.data.workspace);
    } catch (err) {
      setError(getErrorMessage(err)); // e.g. 403 if you are not a member
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/workspaces/${id}/members`, { email, role });
      setEmail("");
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleRoleChange(userId, newRole) {
    setError("");
    try {
      await api.patch(`/workspaces/${id}/members/${userId}`, { role: newRole });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleRemove(userId) {
    if (!window.confirm("Remove this member?")) return;
    setError("");
    try {
      await api.delete(`/workspaces/${id}/members/${userId}`);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (!workspace) {
    return (
      <div>
        {error ? <p className="error">{error}</p> : <p>Loading...</p>}
        <Link to="/">Back to workspaces</Link>
      </div>
    );
  }

  const isOwner = workspace.myRole === "owner";
  const canManage = isOwner || workspace.myRole === "admin";

  return (
    <div>
      <Link to="/">← All workspaces</Link>
      <h2>
        {workspace.name} <span className={`badge ${workspace.myRole}`}>{workspace.myRole}</span>
      </h2>

      {error && <p className="error">{error}</p>}

      {canManage && (
        <form onSubmit={handleAdd} className="row">
          <input type="email" placeholder="Member's email (they must be registered)" value={email} onChange={(e) => setEmail(e.target.value)} />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="member">member</option>
            {isOwner && <option value="admin">admin</option>}
          </select>
          <button type="submit">Add member</button>
        </form>
      )}

      <h3>Members ({workspace.members.length})</h3>
      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr>
        </thead>
        <tbody>
          {workspace.members.map((m) => (
            <tr key={m.id}>
              <td>{m.username} {m.id === user.id && <span className="muted">(you)</span>}</td>
              <td>{m.email}</td>
              <td>
                {isOwner && m.role !== "owner" ? (
                  <select value={m.role} onChange={(e) => handleRoleChange(m.id, e.target.value)}>
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                  </select>
                ) : (
                  <span className={`badge ${m.role}`}>{m.role}</span>
                )}
              </td>
              <td>
                {canManage && m.role !== "owner" && (isOwner || m.role === "member") && (
                  <button className="btn-danger" onClick={() => handleRemove(m.id)}>Remove</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}