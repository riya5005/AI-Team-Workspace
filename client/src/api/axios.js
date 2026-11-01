import axios from "axios";

// Relative URL: in dev, Vite's proxy forwards /api to localhost:5000.
// In production, vercel.json rewrites /api to your Render backend.
// Either way the browser sees one origin, so the httpOnly cookie works.
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 60000, // Render's free tier can take up to ~60s to wake from sleep
});

// Turn any backend error into a readable string
export function getErrorMessage(err) {
  // No response at all: server down, asleep, timed out, or network problem
  if (!err.response) {
    if (err.code === "ECONNABORTED") {
      return "The server is taking too long to respond. It may be waking up, so try again in a moment.";
    }
    return "Cannot reach the server. Check your connection or try again shortly.";
  }

  const data = err.response.data;

  // Validation errors from Zod: [{ field, message }]
  if (data?.details?.length) {
    return data.details.map((d) => `${d.field}: ${d.message}`).join(", ");
  }

  // The rewrite returned HTML instead of JSON (wrong vercel.json or backend error page)
  if (typeof data === "string" && data.trim().startsWith("<")) {
    return `Server returned an unexpected response (status ${err.response.status}).`;
  }

  return data?.message || "Something went wrong";
}

export default api;