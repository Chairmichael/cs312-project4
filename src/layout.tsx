import { Link, Outlet } from "react-router";

export default function Layout() {
  const username: string | null = null;

  return (
    <div>
      <header className="site-header">
        <nav className="site-nav" aria-label="Main navigation">
          <Link className="site-brand" to="/">Cool Blog</Link>
          {username ? (
            <span className="site-username">{username}</span>
          ) : (
            <Link className="site-auth-link" to="/signin">
              Log in / Sign up
            </Link>
          )}
        </nav>
      </header>
      <Outlet />
      <footer />
    </div>
  );
}