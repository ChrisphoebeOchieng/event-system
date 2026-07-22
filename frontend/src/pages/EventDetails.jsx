import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../api/axios";
import Navbar from "../components/Navbar";

function formatDate(value) {
  if (!value) return "Date to be announced";

  return new Intl.DateTimeFormat("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value) {
  if (!value) return "Time to be announced";

  return new Intl.DateTimeFormat("en-KE", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function EventDetails() {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [bookingState, setBookingState] = useState("idle");
  const [bookingMessage, setBookingMessage] = useState("");
  const [createdBooking, setCreatedBooking] = useState(null);
  const bookingAttempted = useRef(false);

  useEffect(() => {
    async function loadEvent() {
      try {
        const [eventResponse, ticketsResponse] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get(`/events/${eventId}/ticket-types`),
        ]);

        const eventData = eventResponse.data.data;
        const tickets = ticketsResponse.data.data || [];

        setEvent(eventData);
        setTicketTypes(tickets);
        setSelectedTicket(tickets[0] || null);
      } catch {
        setErrorMessage(
          "We couldn't load this event. Please try again shortly."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  useEffect(() => {
    async function createPendingBooking() {
      const accessToken = localStorage.getItem("access_token");
      const pendingBooking = localStorage.getItem("pending_booking");

      if (
        !accessToken ||
        !pendingBooking ||
        bookingAttempted.current
      ) {
        return;
      }

      bookingAttempted.current = true;
      setBookingState("loading");
      setBookingMessage("Creating your booking...");

      try {
        const bookingPayload = JSON.parse(pendingBooking);

        const response = await api.post(
          `/events/${eventId}/bookings`,
          bookingPayload
        );

        const booking = response.data.data;

        localStorage.removeItem("pending_booking");
        localStorage.setItem(
          "latest_booking",
          JSON.stringify(booking)
        );

        setCreatedBooking(booking);
        setBookingState("success");
        setBookingMessage(
          `Booking ${booking.booking_reference} was created successfully.`
        );
      } catch (error) {
        localStorage.removeItem("pending_booking");

        setBookingState("error");
        setBookingMessage(
          error.response?.data?.message ||
            "We couldn't complete your booking. Please try again."
        );
      }
    }

    createPendingBooking();
  }, [eventId]);

  const totalPrice = useMemo(() => {
    if (!selectedTicket) return "0.00";

    return (
      Number(selectedTicket.price) * quantity
    ).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [selectedTicket, quantity]);

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />

        <main className="event-detail-page">
          <div className="container event-detail-loading">
            <div className="event-detail-image-skeleton" />
            <div className="event-detail-content-skeleton" />
          </div>
        </main>
      </div>
    );
  }

  if (errorMessage || !event) {
    return (
      <div className="app-shell">
        <Navbar />

        <main className="event-detail-page">
          <div className="container event-detail-error">
            <Ticket size={34} />
            <h1>Event unavailable</h1>
            <p>{errorMessage}</p>

            <Link to="/" className="button button-primary">
              Back to events
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="event-detail-page">
        <section className="event-detail-hero">
          <img
            src={
              event.banner_image ||
              "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
            }
            alt={event.title}
          />

          <div className="event-detail-overlay" />

          <div className="container event-detail-hero-content">
            <Link to="/" className="event-detail-back">
              <ArrowLeft size={17} />
              Back to events
            </Link>

            <div className="event-detail-copy">
              <span className="event-detail-badge">
                {event.status === "published" ? "Tickets available" : "Upcoming"}
              </span>

              <h1>{event.title}</h1>

              <div className="event-detail-meta">
                <span>
                  <CalendarDays size={18} />
                  {formatDate(event.start_date)}
                </span>

                <span>
                  <Clock3 size={18} />
                  {formatTime(event.start_date)}
                </span>

                <span>
                  <MapPin size={18} />
                  {event.venue}, {event.city}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="event-detail-body">
          <div className="container event-detail-grid">
            <div className="event-detail-main">
              <article className="event-detail-section-card">
                <span className="section-kicker">About this event</span>
                <h2>An experience worth remembering.</h2>

                <p>{event.description}</p>
              </article>

              <article className="event-detail-section-card">
                <span className="section-kicker">Location</span>
                <h2>{event.venue}</h2>

                <div className="event-location-card">
                  <span className="event-location-icon">
                    <MapPin size={23} />
                  </span>

                  <div>
                    <strong>{event.venue}</strong>
                    <p>
                      {event.city}, {event.country}
                    </p>
                  </div>
                </div>
              </article>

              <article className="event-detail-section-card">
                <span className="section-kicker">Event information</span>

                <div className="event-information-grid">
                  <div>
                    <CalendarDays size={20} />
                    <span>Date</span>
                    <strong>{formatDate(event.start_date)}</strong>
                  </div>

                  <div>
                    <Clock3 size={20} />
                    <span>Time</span>
                    <strong>
                      {formatTime(event.start_date)} –{" "}
                      {formatTime(event.end_date)}
                    </strong>
                  </div>

                  <div>
                    <Ticket size={20} />
                    <span>Availability</span>
                    <strong>
                      {event.tickets_remaining?.toLocaleString()} tickets
                    </strong>
                  </div>
                </div>
              </article>
            </div>

            <aside className="booking-panel">
              <div className="booking-panel-heading">
                <span className="section-kicker">Choose your ticket</span>
                <h2>Reserve your place.</h2>
              </div>

              {bookingState !== "idle" && (
                <div
                  className={`booking-notice booking-notice-${bookingState}`}
                  role="status"
                >
                  <strong>
                    {bookingState === "loading" && "Processing booking"}
                    {bookingState === "success" && "Booking confirmed"}
                    {bookingState === "error" && "Booking unsuccessful"}
                  </strong>

                  <p>{bookingMessage}</p>

                  {createdBooking && (
                    <Link
                      to={`/checkout/${createdBooking.id}`}
                      className="button button-primary booking-payment-button"
                    >
                      Proceed to payment
                    </Link>
                  )}
                </div>
              )}

              {ticketTypes.length === 0 ? (
                <div className="booking-empty">
                  <Ticket size={26} />
                  <strong>Tickets coming soon</strong>
                  <p>This organizer has not released ticket tiers yet.</p>
                </div>
              ) : (
                <>
                  <div className="ticket-options">
                    {ticketTypes.map((ticketType) => (
                      <button
                        key={ticketType.id}
                        type="button"
                        className={`ticket-option ${
                          selectedTicket?.id === ticketType.id
                            ? "ticket-option-active"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedTicket(ticketType);
                          setQuantity(1);
                        }}
                      >
                        <div>
                          <strong>{ticketType.name}</strong>
                          <span>
                            {ticketType.available_quantity} remaining
                          </span>
                        </div>

                        <p>
                          KES{" "}
                          {Number(ticketType.price).toLocaleString("en-KE")}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="booking-quantity">
                    <div>
                      <span>Quantity</span>
                      <small>
                        Maximum {selectedTicket?.max_per_order} per order
                      </small>
                    </div>

                    <div className="quantity-control">
                      <button
                        type="button"
                        aria-label="Reduce quantity"
                        onClick={() =>
                          setQuantity((current) => Math.max(1, current - 1))
                        }
                      >
                        <Minus size={16} />
                      </button>

                      <strong>{quantity}</strong>

                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() =>
                          setQuantity((current) =>
                            Math.min(
                              selectedTicket?.max_per_order || 10,
                              selectedTicket?.available_quantity || 1,
                              current + 1
                            )
                          )
                        }
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="booking-summary">
                    <div>
                      <span>
                        {selectedTicket?.name} × {quantity}
                      </span>

                      <strong>KES {totalPrice}</strong>
                    </div>

                    <div className="booking-total">
                      <span>Total</span>
                      <strong>KES {totalPrice}</strong>
                    </div>
                  </div>

                  <Link
                    to={
                      selectedTicket
                        ? `/login?redirect=/events/${event.id}&ticket=${selectedTicket.id}&quantity=${quantity}`
                        : "/login"
                    }
                    className="button button-primary booking-button"
                  >
                    Continue to booking
                  </Link>

                  <div className="booking-security">
                    <ShieldCheck size={17} />
                    Secure checkout with protected payments
                  </div>
                </>
              )}
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}

export default EventDetails;
