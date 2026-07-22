import { CalendarDays, MapPin, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await api.get("/events/mine");
        setEvents(response.data.data || []);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  if (loading) {
    return (
      <main className="container">
        <h1>Loading events...</h1>
      </main>
    );
  }

  return (
    <main className="container my-events-page">
      <div className="my-events-header">
        <div>
          <span className="section-kicker">
            Organizer Workspace
          </span>

          <h1>My Events</h1>

          <p>
            Manage every event you've created.
          </p>
        </div>

        <Link
          to="/dashboard/events/create"
          className="button button-primary"
        >
          <Plus size={17} />
          New Event
        </Link>
      </div>

      <div className="event-grid">
        {events.map((event) => (
          <article
            key={event.id}
            className="event-card"
          >
            <img
              src={event.banner_image}
              alt={event.title}
            />

            <div className="event-card-content">
              <h3>{event.title}</h3>

              <p>
                <CalendarDays size={15} />
                {new Date(event.start_date).toLocaleDateString()}
              </p>

              <p>
                <MapPin size={15} />
                {event.venue}, {event.city}
              </p>

              <Link
                className="button button-secondary"
                to={`/events/${event.id}`}
              >
                Manage Event
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

export default MyEvents;
