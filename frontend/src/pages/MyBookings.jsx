import {
  CalendarDays,
  MapPin,
  ReceiptText,
  RotateCcw,
  TicketCheck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
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

  if (loading) {
    return (
      <main className="container my-events-page">
        <div className="my-events-loading">
          <span className="loading-spinner" />
          <h1>Loading your bookings...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="bookings-page">
      <div className="container">
        <header className="bookings-header">
          <div>
            <span className="section-kicker">My account</span>
            <h1>My bookings</h1>
            <p>
              View your tickets, payment status and refund eligibility.
            </p>
          </div>

          <Link to="/refunds" className="button button-secondary">
            <RotateCcw size={17} />
            View refund requests
          </Link>
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

            <h2>You have no bookings yet.</h2>

            <p>
              Bookings will appear here after you reserve tickets for an
              event.
            </p>

            <Link to="/events" className="button button-primary">
              Browse events
            </Link>
          </section>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => {
              const canRequestRefund =
                booking.status === "confirmed" &&
                booking.payment_status === "completed" &&
                !booking.refund;

              return (
                <article className="booking-card" key={booking.id}>
                  <div className="booking-card-top">
                    <div>
                      <span className="booking-reference">
                        {booking.booking_reference}
                      </span>

                      <h2>{booking.event_title}</h2>
                    </div>

                    <span
                      className={`booking-status booking-status-${booking.status}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="booking-details">
                    <p>
                      <CalendarDays size={16} />
                      {new Date(booking.event_date).toLocaleString()}
                    </p>

                    <p>
                      <MapPin size={16} />
                      {booking.event_venue}
                    </p>

                    <p>
                      <TicketCheck size={16} />
                      {booking.ticket_name} · {booking.quantity} ticket(s)
                    </p>

                    <p>
                      <ReceiptText size={16} />
                      Payment: {booking.payment_status || "not paid"}
                    </p>
                  </div>

                  <div className="booking-price">
                    <span>Total paid</span>
                    <strong>
                      KES{" "}
                      {Number(booking.total_amount).toLocaleString("en-KE")}
                    </strong>
                  </div>

                  <div className="booking-actions">
                    <Link
                      to={`/events/${booking.event_id}`}
                      className="button button-secondary"
                    >
                      View event
                    </Link>

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

                    {booking.refund && (
                      <span
                        className={`refund-status refund-status-${booking.refund.status}`}
                      >
                        Refund {booking.refund.status}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {selectedBooking && (
        <div className="refund-modal-backdrop">
          <section
            className="refund-modal"
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

            <span className="section-kicker">Refund request</span>

            <h2 id="refund-modal-title">
              Request a refund for {selectedBooking.event_title}
            </h2>

            <p>
              Explain why you are requesting the refund. An administrator
              will review your request.
            </p>

            <form onSubmit={submitRefund}>
              <div className="form-group">
                <label htmlFor="refund_reason">Reason</label>

                <textarea
                  id="refund_reason"
                  rows="6"
                  placeholder="Explain your reason for requesting a refund."
                  value={refundReason}
                  onChange={(event) =>
                    setRefundReason(event.target.value)
                  }
                />
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
                    : "Submit refund request"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default MyBookings;
