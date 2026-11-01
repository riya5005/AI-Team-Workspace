import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="brand">AI Team Workspace</Link>
        <div>
          <span className="muted">{user.username}</span>
          <button className="btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}