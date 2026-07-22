import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

function formatDate(value) {
  if (!value) return "Date to be announced";

  return new Intl.DateTimeFormat("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function EventCard({ event, featured = false }) {
  return (
    <article className={`event-card ${featured ? "event-card-featured" : ""}`}>
      <Link to={`/events/${event.id}`} className="event-image-link">
        <img
          src={
            event.banner_image ||
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
          }
          alt={event.title}
          className="event-image"
        />

        <div className="event-image-overlay" />

        {event.featured && (
          <span className="event-badge">
            <Sparkles size={14} />
            Featured
          </span>
        )}

        <span className="event-arrow">
          <ArrowUpRight size={19} />
        </span>
      </Link>

      <div className="event-card-content">
        <div className="event-meta">
          <span>
            <CalendarDays size={15} />
            {formatDate(event.start_date)}
          </span>

          <span>
            <MapPin size={15} />
            {event.city || "Location TBA"}
          </span>
        </div>

        <Link to={`/events/${event.id}`}>
          <h3>{event.title}</h3>
        </Link>

        <p>{event.venue || "Venue to be announced"}</p>

        <div className="event-card-footer">
          <span className="event-status">
            {event.status === "published" ? "Tickets available" : "Coming soon"}
          </span>

          <Link to={`/events/${event.id}`} className="text-link">
            View event
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default EventCard;
