import {
  CalendarDays,
  Eye,
  MapPin,
  Plus,
  Send,
  TicketCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";

const fallbackImage =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80";

function MyEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get("/events/mine");
      setEvents(response.data.data || []);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login?redirect=/dashboard/events");
        return;
      }

      setErrorMessage(
        error.response?.data?.message ||
          "Your events could not be loaded. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      navigate("/login?redirect=/dashboard/events");
      return;
    }

    loadEvents();
  }, [loadEvents, navigate]);

  const updateStatus = async (eventId, status) => {
    setActionId(eventId);
    setErrorMessage("");

    try {
      const response = await api.patch(`/events/${eventId}/status`, {
        status,
      });

      setEvents((current) =>
        current.map((event) =>
          event.id === eventId
            ? {
                ...event,
                status: response.data.data.status,
              }
            : event
        )
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "The event status could not be updated."
      );
    } finally {
      setActionId(null);
    }
  };

  const deleteEvent = async (event) => {
    const confirmed = window.confirm(
      `Delete "${event.title}" permanently? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setActionId(event.id);
    setErrorMessage("");

    try {
      await api.delete(`/events/${event.id}`);

      setEvents((current) =>
        current.filter((item) => item.id !== event.id)
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "The event could not be deleted."
      );
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <main className="container my-events-page">
        <div className="my-events-loading">
          <span className="loading-spinner" />
          <h1>Loading your events...</h1>
          <p>Preparing your organizer workspace.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container my-events-page">
      <div className="my-events-header">
        <div>
          <span className="section-kicker">Organizer workspace</span>
          <h1>My Events</h1>
          <p>Create, publish and manage every event in one place.</p>
        </div>

        <Link
          to="/dashboard/events/create"
          className="button button-primary"
        >
          <Plus size={17} />
          New Event
        </Link>
      </div>

      {errorMessage && (
        <div className="form-alert my-events-alert" role="alert">
          {errorMessage}
        </div>
      )}

      {events.length === 0 ? (
        <section className="my-events-empty">
          <span>
            <CalendarDays size={32} />
          </span>

          <h2>You have not created an event yet.</h2>

          <p>
            Create your first event, configure ticket tiers and publish it
            when everything is ready.
          </p>

          <Link
            to="/dashboard/events/create"
            className="button button-primary"
          >
            <Plus size={17} />
            Create your first event
          </Link>
        </section>
      ) : (
        <div className="my-events-grid">
          {events.map((event) => {
            const isProcessing = actionId === event.id;

            return (
              <article className="organizer-event-card" key={event.id}>
                <div className="organizer-event-image">
                  <img
                    src={event.banner_image || fallbackImage}
                    alt={event.title}
                    onError={(imageEvent) => {
                      imageEvent.currentTarget.src = fallbackImage;
                    }}
                  />

                  <span
                    className={`event-status-badge status-${event.status}`}
                  >
                    {event.status}
                  </span>
                </div>

                <div className="organizer-event-content">
                  <div className="organizer-event-heading">
                    <div>
                      <h2>{event.title}</h2>

                      <p>
                        <CalendarDays size={16} />
                        {new Date(event.start_date).toLocaleString()}
                      </p>

                      <p>
                        <MapPin size={16} />
                        {event.venue}, {event.city}
                      </p>
                    </div>
                  </div>

                  <div className="organizer-event-stats">
                    <div>
                      <span>Capacity</span>
                      <strong>{event.capacity}</strong>
                    </div>

                    <div>
                      <span>Remaining</span>
                      <strong>{event.tickets_remaining}</strong>
                    </div>

                    <div>
                      <span>Ticket tiers</span>
                      <strong>{event.ticket_types_count}</strong>
                    </div>
                  </div>

                  <div className="organizer-event-actions">
                    <Link
                      to={`/events/${event.id}`}
                      className="button button-secondary"
                    >
                      <Eye size={16} />
                      View
                    </Link>

                    <Link
                      to={`/dashboard/events/${event.id}/tickets`}
                      className="button button-secondary"
                    >
                      <TicketCheck size={16} />
                      Tickets
                    </Link>

                    {event.status === "draft" && (
                      <button
                        type="button"
                        className="button button-primary"
                        disabled={isProcessing}
                        onClick={() =>
                          updateStatus(event.id, "published")
                        }
                      >
                        <Send size={16} />
                        {isProcessing ? "Publishing..." : "Publish"}
                      </button>
                    )}

                    {event.status === "published" && (
                      <button
                        type="button"
                        className="button button-warning"
                        disabled={isProcessing}
                        onClick={() =>
                          updateStatus(event.id, "cancelled")
                        }
                      >
                        <XCircle size={16} />
                        {isProcessing ? "Cancelling..." : "Cancel"}
                      </button>
                    )}

                    {event.status === "cancelled" && (
                      <button
                        type="button"
                        className="button button-primary"
                        disabled={isProcessing}
                        onClick={() =>
                          updateStatus(event.id, "published")
                        }
                      >
                        <Send size={16} />
                        {isProcessing ? "Publishing..." : "Republish"}
                      </button>
                    )}

                    {event.status === "draft" && (
                      <button
                        type="button"
                        className="button button-danger"
                        disabled={isProcessing}
                        onClick={() => deleteEvent(event)}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default MyEvents;
