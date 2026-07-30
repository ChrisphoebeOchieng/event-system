import {
  Bell,
  CalendarPlus,
  LogOut,
  Menu,
  Search,
  Ticket,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import api from "../api/axios";

function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const accessToken = localStorage.getItem("access_token");
  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem("user");
  }

  const isAuthenticated = Boolean(accessToken && user);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    async function loadUnreadCount() {
      try {
        const response = await api.get(
          "/notifications/unread-count"
        );

        setUnreadCount(response.data.unread_count || 0);
      } catch {
        setUnreadCount(0);
      }
    }

    loadUnreadCount();
  }, [isAuthenticated]);

  const navigation = [
    { name: "Discover", path: "/" },
    { name: "Events", path: "/events" },
  ];

  if (user?.role === "attendee") {
    navigation.push({
      name: "Dashboard",
      path: "/attendee/dashboard",
    });
  }

  if (isAuthenticated) {
    navigation.push({
      name: "My Bookings",
      path: "/bookings",
    });

    navigation.push({
      name: "Payments",
      path: "/payments",
    });
  }

  if (user?.role === "organizer") {
    navigation.push({
      name: "For Organizers",
      path: "/dashboard",
    });
  }

  if (user?.role === "admin") {
    navigation.push({
      name: "Admin",
      path: "/admin/dashboard",
    });
  }

  if (
    user?.role === "vendor" ||
    user?.role === "admin"
  ) {
    navigation.push({
      name: "Vendor",
      path: "/vendor",
    });
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("latest_booking");
    localStorage.removeItem("latest_payment");
    localStorage.removeItem("pending_booking");

    setMobileOpen(false);
    navigate("/login");
  };

  return (
    <header className="site-header">
      <nav className="navbar container">
        <Link
          to="/"
          className="brand"
          aria-label="Event System home"
        >
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
                `nav-link ${
                  isActive ? "nav-link-active" : ""
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="navbar-actions">
          <button
            className="search-trigger"
            type="button"
          >
            <Search size={18} />
            <span>Search events</span>
            <kbd>⌘ K</kbd>
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/notifications"
                className="notification-bell"
                aria-label={`Notifications. ${unreadCount} unread`}
              >
                <Bell size={20} />

                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>

              {(user.role === "organizer" ||
                user.role === "admin") && (
                <Link
                  to="/dashboard/events/create"
                  className="button button-primary desktop-only"
                >
                  <CalendarPlus size={17} />
                  Create event
                </Link>
              )}

              <button
                type="button"
                className="button button-ghost desktop-only"
                onClick={handleLogout}
              >
                <LogOut size={17} />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="button button-ghost desktop-only"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="button button-primary desktop-only"
              >
                Create account
              </Link>
            </>
          )}

          <button
            className="mobile-menu-button"
            type="button"
            aria-label="Toggle navigation"
            onClick={() =>
              setMobileOpen((current) => !current)
            }
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

            {isAuthenticated ? (
              <>
                <Link
                  to="/notifications"
                  className="mobile-notification-link"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>Notifications</span>

                  {unreadCount > 0 && (
                    <span className="notification-badge">
                      {unreadCount > 99
                        ? "99+"
                        : unreadCount}
                    </span>
                  )}
                </Link>

                <button
                  type="button"
                  className="button button-secondary"
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="button button-secondary"
                  onClick={() => setMobileOpen(false)}
                >
                  Log in
                </Link>

                <Link
                  to="/register"
                  className="button button-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
