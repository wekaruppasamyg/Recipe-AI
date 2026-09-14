import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);
  const linkClass = ({ isActive }) => `nav-link${isActive ? " is-active" : ""}`;

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main navigation">
      <Link to="/" className="brand" onClick={closeMenu}><span className="brand-mark" aria-hidden="true">S</span><span>Smart<span>Recipe</span></span></Link>
      <button type="button" className="nav-toggle" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
      <div id="primary-navigation" className={`nav-links${menuOpen ? " is-open" : ""}`}>
        <div className="nav-main-links">
        <NavLink to="/" end className={linkClass} onClick={closeMenu}>Discover</NavLink>
        <NavLink to="/ingredients" className={linkClass} onClick={closeMenu}>Ingredients</NavLink>
        {user && <NavLink to="/favorites" className={linkClass} onClick={closeMenu}>Saved recipes</NavLink>}
        </div>
        <div className="nav-account">
        {user ? (
          <>
            <span className="nav-user"><span className="user-avatar">{user.name?.slice(0, 1).toUpperCase()}</span>{user.name}</span>
            <button className="nav-logout" type="button" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={linkClass} onClick={closeMenu}>Log in</NavLink>
            <NavLink to="/register" className="nav-signup" onClick={closeMenu}>Create account</NavLink>
          </>
        )}
        </div>
      </div>
      </nav>
    </header>
  );
}
