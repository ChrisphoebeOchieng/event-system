import {
  CalendarPlus,
  ChevronDown,
  Menu,
  Search,
  Ticket,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    { name: "Discover", path: "/" },
    { name: "Events", path: "/events" },
    { name: "For Organizers", path: "/dashboard" },
  ];

  return (
    <header className="site-header">
      <nav className="navbar container">
        <Link to="/" className="brand" aria-label="Event System home">
          <span className="brand-mark">
            <Ticket size={21} strokeWidth={2.2} />
          </span>

          <span className="brand-copy">
            <strong>Event</strong>
            <span>System</span>
          </span>
        </Link>

        <div className="desktop-navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="navbar-actions">
          <button className="search-trigger" type="button">
            <Search size={18} />
            <span>Search events</span>
            <kbd>⌘ K</kbd>
          </button>

          <Link to="/login" className="button button-ghost desktop-only">
            Log in
          </Link>

          <Link to="/dashboard" className="button button-primary desktop-only">
            <CalendarPlus size={17} />
            Create event
          </Link>

          <button
            className="mobile-menu-button"
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((current) => !current)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mobile-navigation">
          <div className="container">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}

            <Link
              to="/login"
              className="button button-secondary"
              onClick={() => setMobileOpen(false)}
            >
              Log in
            </Link>

            <Link
              to="/dashboard"
              className="button button-primary"
              onClick={() => setMobileOpen(false)}
            >
              Create event
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
