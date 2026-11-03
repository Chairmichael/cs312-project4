import { Link, Outlet } from "react-router";

export default function Layout() {
  const username: string | null = localStorage.getItem('username') ?? '';

  return (
    <div>
      <header className="site-header">
        <nav className="site-nav header" aria-label="Main navigation" style={{ marginBottom: '1rem' }}>
          <Link className="site-brand" to="/">Cool Blog</Link>
          {username ? (
            <div>
              <span className="site-username">{username}</span>
              <a style={{ marginRight: '0.5rem' }} className="site-auth-link" href="/" onClick={() => localStorage.removeItem('username')}>
                Log out
              </a>
            </div>
          ) : (
            <Link className="site-auth-link" to="/signin">
              Log in / Sign up
            </Link>
          )}
        </nav>
      </header>
      <div className="page-content">
        <Outlet />
      </div>
      <footer />
    </div>
  );
}