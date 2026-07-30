import { ShieldX } from "lucide-react";
import { Link } from "react-router-dom";

function Unauthorized() {
  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  const homePath =
    user?.role === "organizer" || user?.role === "admin"
      ? "/dashboard"
      : "/events";

  return (
    <main className="unauthorized-page">
      <section className="unauthorized-card">
        <span className="unauthorized-icon">
          <ShieldX size={42} />
        </span>

        <span className="section-kicker">Access restricted</span>

        <h1>You do not have permission to view this page.</h1>

        <p>
          This section is only available to users with the required account
          role.
        </p>

        <Link to={homePath} className="button button-primary">
          Return to your dashboard
        </Link>
      </section>
    </main>
  );
}

export default Unauthorized;
