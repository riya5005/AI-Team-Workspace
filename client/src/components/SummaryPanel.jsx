import { useState } from "react";
import api, { getErrorMessage } from "../api/axios";

export default function SummaryPanel({ workspaceId }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getSummary() {
    setError("");
    setLoading(true);
    try {
      const res = await api.get(`/workspaces/${workspaceId}/ai/summary`);
      setSummary(res.data.summary);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ margin: "24px 0" }}>
      <h3>Workspace summary</h3>
      <button onClick={getSummary} disabled={loading}>
        {loading ? "Writing summary..." : "Summarize this workspace"}
      </button>
      {error && <p className="error">{error}</p>}
      {summary && <p>{summary}</p>}
    </div>
  );
}