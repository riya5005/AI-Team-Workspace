import { useState } from "react";
import api, { getErrorMessage } from "../api/axios";

export default function AiBreakdown({ workspaceId, projectId, onAdded }) {
  const [goal, setGoal] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate(e) {
    e.preventDefault();
    setError("");
    setSuggestions([]);
    setLoading(true);
    try {
      const res = await api.post(`/workspaces/${workspaceId}/ai/breakdown`, { goal });
      setSuggestions(res.data.subtasks);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function addAll() {
    setError("");
    try {
      for (const s of suggestions) {
        await api.post(`/workspaces/${workspaceId}/tasks`, {
          project: projectId,
          title: s.title,
          priority: s.priority,
        });
      }
      setSuggestions([]);
      setGoal("");
      onAdded();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div style={{ margin: "16px 0", padding: 12, background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb" }}>
      <strong>AI task breakdown</strong>
      <form onSubmit={generate} className="row">
        <input placeholder='Describe a goal, e.g. "Launch landing page"' value={goal} onChange={(e) => setGoal(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? "Thinking..." : "Generate"}</button>
      </form>
      {error && <p className="error">{error}</p>}
      {suggestions.length > 0 && (
        <>
          <ul>
            {suggestions.map((s, i) => (
              <li key={i}>{s.title} <span className={`badge ${s.priority}`}>{s.priority}</span></li>
            ))}
          </ul>
          <button onClick={addAll}>Add all as tasks</button>{" "}
          <button className="btn-secondary" onClick={() => setSuggestions([])}>Discard</button>
        </>
      )}
    </div>
  );
}