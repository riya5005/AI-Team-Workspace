import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/axios";

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? Skip this page.
  if (user) return <Navigate to="/" replace />;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.username, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>{isLogin ? "Welcome back" : "Create your account"}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input name="username" placeholder="Username" value={form.username} onChange={handleChange} />
        )}
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="password" type="password" placeholder="Password (min 8 chars)" value={form.password} onChange={handleChange} />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Please wait..." : isLogin ? "Login" : "Register"}
        </button>
      </form>
      <p className="muted">
        {isLogin ? (
          <>No account? <Link to="/register">Register</Link></>
        ) : (
          <>Already have an account? <Link to="/login">Login</Link></>
        )}
      </p>
    </div>
  );
}