import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  ReceiptText,
  RotateCcw,
  TicketCheck,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import Navbar from "../components/Navbar";

function MyRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadRefunds() {
      try {
        const response = await api.get("/refunds/me");
        setRefunds(response.data.data || []);
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ||
            "Your refund requests could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRefunds();
  }, []);

  const statusIcon = (status) => {
    if (status === "completed" || status === "approved") {
      return <CheckCircle2 size={18} />;
    }

    if (status === "rejected") {
      return <XCircle size={18} />;
    }

    return <Clock3 size={18} />;
  };

  const statusMessage = (status) => {
    const messages = {
      pending:
        "Your request has been submitted and is waiting for administrator review.",
      approved:
        "Your request has been approved and is waiting to be completed.",
      rejected:
        "Your refund request was reviewed and was not approved.",
      completed:
        "Your refund has been completed and your booking was cancelled.",
    };

    return messages[status] || "Your refund request is being processed.";
  };

  const progressStep = (status) => {
    const steps = {
      pending: 1,
      approved: 2,
      rejected: 2,
      completed: 3,
    };

    return steps[status] || 1;
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />

        <main className="container my-events-page">
          <div className="my-events-loading">
            <span className="loading-spinner" />
            <h1>Loading your refunds...</h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="refund-history-page">
        <div className="container">
          <header className="refund-history-header">
            <div>
              <span className="section-kicker">Your account</span>
              <h1>Refund history</h1>
              <p>
                Follow every refund request from submission through review
                and completion.
              </p>
            </div>

            <Link to="/bookings" className="button button-secondary">
              <TicketCheck size={17} />
              Back to bookings
            </Link>
          </header>

          {errorMessage && (
            <div className="form-alert refund-history-alert" role="alert">
              {errorMessage}
            </div>
          )}

          <section className="refund-history-summary">
            <div>
              <span className="refund-summary-icon">
                <RotateCcw size={23} />
              </span>

              <div>
                <small>Total requests</small>
                <strong>{refunds.length}</strong>
              </div>
            </div>

            <div>
              <span className="refund-summary-icon">
                <Clock3 size={23} />
              </span>

              <div>
                <small>Pending</small>
                <strong>
                  {
                    refunds.filter(
                      (refund) => refund.status === "pending"
                    ).length
                  }
                </strong>
              </div>
            </div>

            <div>
              <span className="refund-summary-icon">
                <CheckCircle2 size={23} />
              </span>

              <div>
                <small>Completed</small>
                <strong>
                  {
                    refunds.filter(
                      (refund) => refund.status === "completed"
                    ).length
                  }
                </strong>
              </div>
            </div>
          </section>

          {refunds.length === 0 ? (
            <section className="my-events-empty">
              <span>
                <RotateCcw size={32} />
              </span>

              <h2>No refund requests yet.</h2>

              <p>
                Eligible confirmed bookings can be refunded from your
                bookings page.
              </p>

              <Link to="/bookings" className="button button-primary">
                View my bookings
              </Link>
            </section>
          ) : (
            <div className="refund-history-list">
              {refunds.map((refund) => {
                const currentStep = progressStep(refund.status);
                const isRejected = refund.status === "rejected";

                return (
                  <article
                    className="refund-history-card"
                    key={refund.id}
                  >
                    <div className="refund-history-card-header">
                      <div className="refund-history-heading">
                        <span className="refund-history-icon">
                          <RotateCcw size={22} />
                        </span>

                        <div>
                          <span className="booking-reference">
                            {refund.booking.reference}
                          </span>

                          <h2>{refund.booking.event_title}</h2>

                          <p>
                            {refund.booking.ticket_name} ·{" "}
                            {refund.booking.quantity} ticket
                            {refund.booking.quantity !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`refund-status refund-status-${refund.status}`}
                      >
                        {statusIcon(refund.status)}
                        {refund.status}
                      </span>
                    </div>

                    <div className="refund-status-message">
                      <strong>{statusMessage(refund.status)}</strong>

                      <span>
                        Last updated{" "}
                        {new Date(
                          refund.processed_at || refund.requested_at
                        ).toLocaleString("en-KE")}
                      </span>
                    </div>

                    <div
                      className={`refund-progress ${
                        isRejected ? "refund-progress-rejected" : ""
                      }`}
                    >
                      <div
                        className={`refund-progress-step ${
                          currentStep >= 1 ? "active" : ""
                        }`}
                      >
                        <span>
                          <ReceiptText size={16} />
                        </span>

                        <div>
                          <strong>Submitted</strong>
                          <small>Request received</small>
                        </div>
                      </div>

                      <div
                        className={`refund-progress-line ${
                          currentStep >= 2 ? "active" : ""
                        }`}
                      />

                      <div
                        className={`refund-progress-step ${
                          currentStep >= 2 ? "active" : ""
                        }`}
                      >
                        <span>
                          {isRejected ? (
                            <XCircle size={16} />
                          ) : (
                            <Clock3 size={16} />
                          )}
                        </span>

                        <div>
                          <strong>
                            {isRejected ? "Rejected" : "Reviewed"}
                          </strong>
                          <small>
                            {isRejected
                              ? "Not approved"
                              : "Administrator decision"}
                          </small>
                        </div>
                      </div>

                      <div
                        className={`refund-progress-line ${
                          currentStep >= 3 ? "active" : ""
                        }`}
                      />

                      <div
                        className={`refund-progress-step ${
                          currentStep >= 3 ? "active" : ""
                        }`}
                      >
                        <span>
                          <CheckCircle2 size={16} />
                        </span>

                        <div>
                          <strong>Completed</strong>
                          <small>Refund processed</small>
                        </div>
                      </div>
                    </div>

                    <div className="refund-history-details">
                      <div>
                        <CalendarDays size={18} />

                        <span>
                          <small>Requested</small>
                          <strong>
                            {new Date(
                              refund.requested_at
                            ).toLocaleDateString("en-KE", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </strong>
                        </span>
                      </div>

                      <div>
                        <ReceiptText size={18} />

                        <span>
                          <small>Refund amount</small>
                          <strong>
                            KES{" "}
                            {Number(refund.amount).toLocaleString(
                              "en-KE"
                            )}
                          </strong>
                        </span>
                      </div>

                      <div>
                        <TicketCheck size={18} />

                        <span>
                          <small>Booking reference</small>
                          <strong>
                            {refund.booking.reference}
                          </strong>
                        </span>
                      </div>

                      <div>
                        <MapPin size={18} />

                        <span>
                          <small>Request status</small>
                          <strong>{refund.status}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="refund-history-reason">
                      <span>Reason for refund</span>
                      <p>{refund.reason}</p>
                    </div>

                    {refund.admin_note && (
                      <div className="refund-history-admin-note">
                        <span>Administrator response</span>
                        <p>{refund.admin_note}</p>
                      </div>
                    )}

                    <div className="refund-history-footer">
                      <Link
                        to="/bookings"
                        className="button button-secondary"
                      >
                        View booking
                      </Link>

                      <Link
                        to="/notifications"
                        className="text-link"
                      >
                        View related updates
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MyRefunds;
