import { ArrowLeft, ShieldCheck, Sparkles, TicketCheck } from "lucide-react";
import { Link } from "react-router-dom";

function AuthLayout({ children, title, description }) {
  return (
    <div className="auth-page">
      <section className="auth-visual">
        <Link to="/" className="brand auth-brand">
          <span className="brand-mark">
            <TicketCheck size={21} />
          </span>

          <span className="brand-copy">
            <strong>Event</strong>
            <span>System</span>
          </span>
        </Link>

        <div className="auth-visual-content">
          <span className="auth-kicker">
            <Sparkles size={15} />
            Built for unforgettable experiences
          </span>

          <h1>
            Discover events.
            <span>Make memories.</span>
          </h1>

          <p>
            Secure bookings, instant confirmation and a premium event
            experience from discovery to entry.
          </p>

          <div className="auth-feature-card">
            <ShieldCheck size={22} />

            <div>
              <strong>Safe and secure</strong>
              <span>Your account and bookings stay protected.</span>
            </div>
          </div>
        </div>

        <p className="auth-visual-footer">
          Africa’s modern event discovery and ticketing platform.
        </p>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-shell">
          <Link to="/" className="auth-back-link">
            <ArrowLeft size={17} />
            Back to events
          </Link>

          <div className="auth-heading">
            <h2>{title}</h2>
            <p>{description}</p>
          </div>

          {children}
        </div>
      </section>
    </div>
  );
}

export default AuthLayout;
