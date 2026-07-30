import {
  CalendarDays,
  Clock3,
  MapPin,
  ReceiptText,
  RotateCcw,
  TicketCheck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import Navbar from "../components/Navbar";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsBooking, setDetailsBooking] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadBookings() {
      try {
        const response = await api.get("/bookings/me");
        setBookings(response.data.data || []);
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ||
            "Your bookings could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  const openRefundForm = (booking) => {
    setSelectedBooking(booking);
    setRefundReason("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const closeRefundForm = () => {
    setSelectedBooking(null);
    setRefundReason("");
  };

  const submitRefund = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (refundReason.trim().length < 10) {
      setErrorMessage(
        "Please give a refund reason with at least 10 characters."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post("/refunds", {
        booking_id: selectedBooking.id,
        reason: refundReason.trim(),
      });

      setBookings((current) =>
        current.map((booking) =>
          booking.id === selectedBooking.id
            ? {
                ...booking,
                refund: {
                  id: response.data.data.id,
                  status: response.data.data.status,
                },
              }
            : booking
        )
      );

      setSuccessMessage("Refund request submitted successfully.");
      closeRefundForm();
    } catch (error) {
      const response = error.response?.data;

      setErrorMessage(
        response?.message ||
          Object.values(response?.errors || {})?.[0]?.[0] ||
          "The refund request could not be submitted."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-KE", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />

        <main className="container my-events-page">
          <div className="my-events-loading">
            <span className="loading-spinner" />
            <h1>Loading your bookings...</h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="bookings-page bookings-page-polished">
        <div className="container">
          <header className="bookings-header bookings-header-polished">
            <div>
              <span className="section-kicker">Your experiences</span>
              <h1>My bookings</h1>
              <p>
                Everything you have booked, paid for and requested a refund
                for, all in one place.
              </p>
            </div>

            <div className="bookings-header-actions">
              <Link to="/events" className="button button-secondary">
                Browse events
              </Link>

              <Link to="/refunds" className="button button-primary">
                <RotateCcw size={17} />
                Refund history
              </Link>
            </div>
          </header>

          {errorMessage && (
            <div className="form-alert bookings-alert" role="alert">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="form-success bookings-alert" role="status">
              {successMessage}
            </div>
          )}

          {bookings.length === 0 ? (
            <section className="my-events-empty">
              <span>
                <TicketCheck size={32} />
              </span>

              <h2>No bookings yet.</h2>

              <p>
                Your tickets will appear here after you reserve an event.
              </p>

              <Link to="/events" className="button button-primary">
                Explore events
              </Link>
            </section>
          ) : (
            <div className="booking-ticket-list">
              {bookings.map((booking) => {
                const canRequestRefund =
                  booking.status === "confirmed" &&
                  booking.payment_status === "completed" &&
                  !booking.refund;

                return (
                  <article
                    className="booking-ticket-card"
                    key={booking.id}
                  >
                    <div className="booking-ticket-image-wrap">
                      {booking.event_image ? (
                        <img
                          src={booking.event_image}
                          alt={booking.event_title}
                          className="booking-ticket-image"
                        />
                      ) : (
                        <div className="booking-ticket-image-fallback">
                          <TicketCheck size={42} />
                        </div>
                      )}

                      <span
                        className={`booking-status booking-status-${booking.status}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="booking-ticket-content">
                      <div className="booking-ticket-heading">
                        <div>
                          <span className="booking-reference">
                            {booking.booking_reference}
                          </span>

                          <h2>{booking.event_title}</h2>
                        </div>

                        <div className="booking-ticket-price">
                          <span>Total</span>
                          <strong>
                            KES{" "}
                            {Number(
                              booking.total_amount
                            ).toLocaleString("en-KE")}
                          </strong>
                        </div>
                      </div>

                      <div className="booking-ticket-meta">
                        <div>
                          <CalendarDays size={18} />
                          <span>
                            <strong>
                              {formatDate(booking.event_date)}
                            </strong>
                            <small>
                              {formatTime(booking.event_date)}
                            </small>
                          </span>
                        </div>

                        <div>
                          <MapPin size={18} />
                          <span>
                            <strong>{booking.event_venue}</strong>
                            <small>
                              {booking.event_city},{" "}
                              {booking.event_country}
                            </small>
                          </span>
                        </div>

                        <div>
                          <TicketCheck size={18} />
                          <span>
                            <strong>{booking.ticket_name}</strong>
                            <small>
                              {booking.quantity} ticket
                              {booking.quantity !== 1 ? "s" : ""}
                            </small>
                          </span>
                        </div>

                        <div>
                          <ReceiptText size={18} />
                          <span>
                            <strong>
                              {booking.payment_status === "completed"
                                ? "Payment complete"
                                : "Payment pending"}
                            </strong>
                            <small>
                              {booking.payment_status || "not paid"}
                            </small>
                          </span>
                        </div>
                      </div>

                      <div className="booking-ticket-footer">
                        <div className="booking-ticket-refund-state">
                          {booking.refund ? (
                            <span
                              className={`refund-status refund-status-${booking.refund.status}`}
                            >
                              Refund {booking.refund.status}
                            </span>
                          ) : (
                            <span className="booking-no-refund">
                              No refund requested
                            </span>
                          )}
                        </div>

                        <div className="booking-ticket-actions">
                          <button
                            type="button"
                            className="button button-secondary"
                            onClick={() => setDetailsBooking(booking)}
                          >
                            View details
                          </button>

                          {canRequestRefund && (
                            <button
                              type="button"
                              className="button button-danger"
                              onClick={() => openRefundForm(booking)}
                            >
                              <RotateCcw size={16} />
                              Request refund
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {detailsBooking && (
          <div className="refund-modal-backdrop">
            <section
              className="booking-details-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-details-title"
            >
              <button
                type="button"
                className="refund-modal-close"
                aria-label="Close booking details"
                onClick={() => setDetailsBooking(null)}
              >
                <X size={20} />
              </button>

              <div className="booking-details-hero">
                {detailsBooking.event_image ? (
                  <img
                    src={detailsBooking.event_image}
                    alt={detailsBooking.event_title}
                  />
                ) : (
                  <div className="booking-details-placeholder">
                    <TicketCheck size={42} />
                  </div>
                )}
              </div>

              <div className="booking-details-modal-body">
                <span className="section-kicker">
                  Booking details
                </span>

                <h2 id="booking-details-title">
                  {detailsBooking.event_title}
                </h2>

                <div className="booking-detail-reference-box">
                  <span>Booking reference</span>
                  <strong>
                    {detailsBooking.booking_reference}
                  </strong>
                </div>

                <div className="booking-detail-grid">
                  <div>
                    <CalendarDays size={18} />
                    <span>
                      <small>Date and time</small>
                      <strong>
                        {formatDate(detailsBooking.event_date)}
                      </strong>
                      <p>{formatTime(detailsBooking.event_date)}</p>
                    </span>
                  </div>

                  <div>
                    <MapPin size={18} />
                    <span>
                      <small>Venue</small>
                      <strong>{detailsBooking.event_venue}</strong>
                      <p>
                        {detailsBooking.event_city},{" "}
                        {detailsBooking.event_country}
                      </p>
                    </span>
                  </div>

                  <div>
                    <TicketCheck size={18} />
                    <span>
                      <small>Ticket</small>
                      <strong>{detailsBooking.ticket_name}</strong>
                      <p>
                        {detailsBooking.quantity} ticket
                        {detailsBooking.quantity !== 1 ? "s" : ""}
                      </p>
                    </span>
                  </div>

                  <div>
                    <ReceiptText size={18} />
                    <span>
                      <small>Payment</small>
                      <strong>
                        {detailsBooking.payment_status || "Not paid"}
                      </strong>
                      <p>
                        KES{" "}
                        {Number(
                          detailsBooking.total_amount
                        ).toLocaleString("en-KE")}
                      </p>
                    </span>
                  </div>
                </div>

                <div className="booking-detail-status-row">
                  <span
                    className={`booking-status booking-status-${detailsBooking.status}`}
                  >
                    Booking {detailsBooking.status}
                  </span>

                  {detailsBooking.refund && (
                    <span
                      className={`refund-status refund-status-${detailsBooking.refund.status}`}
                    >
                      Refund {detailsBooking.refund.status}
                    </span>
                  )}
                </div>

                <div className="booking-details-modal-actions">
                  <Link
                    to={`/events/${detailsBooking.event_id}`}
                    className="button button-secondary"
                  >
                    View event
                  </Link>

                  {detailsBooking.refund ? (
                    <Link
                      to="/refunds"
                      className="button button-primary"
                    >
                      View refund details
                    </Link>
                  ) : (
                    detailsBooking.status === "confirmed" &&
                    detailsBooking.payment_status === "completed" && (
                      <button
                        type="button"
                        className="button button-danger"
                        onClick={() => {
                          setDetailsBooking(null);
                          openRefundForm(detailsBooking);
                        }}
                      >
                        <RotateCcw size={16} />
                        Request refund
                      </button>
                    )
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {selectedBooking && (
          <div className="refund-modal-backdrop">
            <section
              className="refund-modal refund-modal-polished"
              role="dialog"
              aria-modal="true"
              aria-labelledby="refund-modal-title"
            >
              <button
                type="button"
                className="refund-modal-close"
                aria-label="Close refund form"
                onClick={closeRefundForm}
              >
                <X size={20} />
              </button>

              <span className="refund-modal-icon">
                <RotateCcw size={24} />
              </span>

              <span className="section-kicker">Refund request</span>

              <h2 id="refund-modal-title">
                Request refund
              </h2>

              <div className="refund-selected-booking">
                <strong>{selectedBooking.event_title}</strong>
                <span>
                  {selectedBooking.booking_reference} · KES{" "}
                  {Number(
                    selectedBooking.total_amount
                  ).toLocaleString("en-KE")}
                </span>
              </div>

              <p>
                Explain why you are requesting the refund. An administrator
                will review your request before it is processed.
              </p>

              <form onSubmit={submitRefund}>
                <div className="form-group">
                  <label htmlFor="refund_reason">
                    Reason for refund
                  </label>

                  <textarea
                    id="refund_reason"
                    rows="6"
                    maxLength="1000"
                    placeholder="Tell us what happened and why you would like a refund."
                    value={refundReason}
                    onChange={(event) =>
                      setRefundReason(event.target.value)
                    }
                  />

                  <span className="refund-character-count">
                    {refundReason.length}/1000
                  </span>
                </div>

                <div className="refund-processing-note">
                  <Clock3 size={17} />
                  Refund requests are reviewed by an administrator.
                </div>

                <div className="refund-modal-actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={closeRefundForm}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="button button-primary"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Submitting request..."
                      : "Submit request"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default MyBookings;
