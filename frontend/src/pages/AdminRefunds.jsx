import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  RotateCcw,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import Navbar from "../components/Navbar";

function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const loadRefunds = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get("/admin/refunds");
      setRefunds(response.data.data || []);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Refund requests could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  const statistics = useMemo(
    () => [
      {
        label: "Total requests",
        value: refunds.length,
        icon: RotateCcw,
        detail: "All refund requests",
      },
      {
        label: "Pending review",
        value: refunds.filter(
          (refund) => refund.status === "pending"
        ).length,
        icon: Clock3,
        detail: "Require admin action",
      },
      {
        label: "Completed",
        value: refunds.filter(
          (refund) => refund.status === "completed"
        ).length,
        icon: CheckCircle2,
        detail: "Successfully processed",
      },
      {
        label: "Requested value",
        value: `KES ${refunds
          .reduce(
            (total, refund) =>
              total + Number(refund.amount || 0),
            0
          )
          .toLocaleString("en-KE")}`,
        icon: CircleDollarSign,
        detail: "Total refund amount",
      },
    ],
    [refunds]
  );

  const openAction = (refund, action) => {
    setSelectedRefund(refund);
    setSelectedAction(action);
    setAdminNote(refund.admin_note || "");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const closeAction = () => {
    setSelectedRefund(null);
    setSelectedAction("");
    setAdminNote("");
  };

  const submitAction = async () => {
    if (!selectedRefund || !selectedAction) {
      return;
    }

    if (
      selectedAction === "rejected" &&
      adminNote.trim().length < 5
    ) {
      setErrorMessage(
        "Please provide a clear reason before rejecting."
      );
      return;
    }

    setActionLoading(true);
    setErrorMessage("");

    try {
      const response = await api.patch(
        `/admin/refunds/${selectedRefund.id}`,
        {
          status: selectedAction,
          admin_note: adminNote.trim() || null,
        }
      );

      const updatedRefund = response.data.data;

      setRefunds((current) =>
        current.map((refund) =>
          refund.id === updatedRefund.id
            ? updatedRefund
            : refund
        )
      );

      setSuccessMessage(
        `Refund marked as ${updatedRefund.status}.`
      );

      closeAction();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "The refund could not be updated."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const modalTitle = {
    approved: "Approve refund request",
    rejected: "Reject refund request",
    completed: "Complete refund",
  }[selectedAction];

  return (
    <div className="app-shell">
      <Navbar />

      <main className="organizer-dashboard-page">
        <section className="organizer-dashboard-hero">
          <div className="container organizer-dashboard-hero-content">
            <div>
              <span className="section-kicker">
                Administrator workspace
              </span>

              <h1>
                Refund <span>management.</span>
              </h1>

              <p>
                Review attendee requests, approve valid refunds and
                complete refund processing.
              </p>
            </div>

            <button
              type="button"
              className="button button-primary"
              onClick={loadRefunds}
            >
              <RotateCcw size={18} />
              Refresh requests
            </button>
          </div>
        </section>

        <section className="organizer-dashboard-content">
          <div className="container">
            <div className="organizer-dashboard-tabs">
              <Link to="/dashboard">Overview</Link>

              <Link to="/admin/vendors">
                Vendor approvals
              </Link>

              <Link
                to="/admin/refunds"
                className="organizer-tab-active"
              >
                Refunds
              </Link>

              <Link to="/notifications">Notifications</Link>
            </div>

            {errorMessage && (
              <div
                className="form-alert bookings-alert"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div
                className="form-success bookings-alert"
                role="status"
              >
                {successMessage}
              </div>
            )}

            {loading ? (
              <div className="organizer-stat-grid">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="organizer-stat-card organizer-loading-card"
                  />
                ))}
              </div>
            ) : (
              <>
                <section className="organizer-stat-grid">
                  {statistics.map((statistic) => {
                    const Icon = statistic.icon;

                    return (
                      <article
                        className="organizer-stat-card"
                        key={statistic.label}
                      >
                        <div className="organizer-stat-top">
                          <span className="organizer-stat-icon">
                            <Icon size={20} />
                          </span>
                        </div>

                        <p>{statistic.label}</p>
                        <strong>{statistic.value}</strong>
                        <small>{statistic.detail}</small>
                      </article>
                    );
                  })}
                </section>

                <section className="organizer-bookings-card">
                  <div className="organizer-card-heading">
                    <div>
                      <span className="section-kicker">
                        Refund requests
                      </span>

                      <h2>Attendee refund activity</h2>
                    </div>

                    <span className="booking-status booking-status-confirmed">
                      {refunds.length} requests
                    </span>
                  </div>

                  {refunds.length === 0 ? (
                    <div className="organizer-empty-state">
                      <RotateCcw size={31} />

                      <h3>No refund requests</h3>

                      <p>
                        New attendee refund requests will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="organizer-table-wrapper">
                      <table className="organizer-table">
                        <thead>
                          <tr>
                            <th>Reference</th>
                            <th>Event</th>
                            <th>Amount</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Requested</th>
                            <th>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {refunds.map((refund) => (
                            <tr key={refund.id}>
                              <td>
                                <strong>
                                  {refund.booking.reference}
                                </strong>
                              </td>

                              <td>
                                <strong>
                                  {refund.booking.event_title}
                                </strong>

                                <br />

                                <small>
                                  {refund.booking.ticket_name} ·{" "}
                                  {refund.booking.quantity} ticket(s)
                                </small>
                              </td>

                              <td>
                                KES{" "}
                                {Number(
                                  refund.amount
                                ).toLocaleString("en-KE")}
                              </td>

                              <td>
                                {refund.reason.length > 45
                                  ? `${refund.reason.slice(0, 45)}...`
                                  : refund.reason}
                              </td>

                              <td>
                                <span
                                  className={`refund-status refund-status-${refund.status}`}
                                >
                                  {refund.status}
                                </span>
                              </td>

                              <td>
                                {new Intl.DateTimeFormat("en-KE", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }).format(
                                  new Date(refund.requested_at)
                                )}
                              </td>

                              <td>
                                <div className="refund-actions">
                                  {refund.status === "pending" && (
                                    <>
                                      <button
                                        type="button"
                                        className="button button-primary"
                                        onClick={() =>
                                          openAction(
                                            refund,
                                            "approved"
                                          )
                                        }
                                      >
                                        Approve
                                      </button>

                                      <button
                                        type="button"
                                        className="button button-danger"
                                        onClick={() =>
                                          openAction(
                                            refund,
                                            "rejected"
                                          )
                                        }
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}

                                  {refund.status === "approved" && (
                                    <button
                                      type="button"
                                      className="button button-primary"
                                      onClick={() =>
                                        openAction(
                                          refund,
                                          "completed"
                                        )
                                      }
                                    >
                                      Complete
                                    </button>
                                  )}

                                  {[
                                    "completed",
                                    "rejected",
                                  ].includes(refund.status) && (
                                    <span>
                                      No action required
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </section>

        {selectedRefund && (
          <div className="refund-modal-backdrop">
            <section
              className="refund-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="refund-action-title"
            >
              <button
                type="button"
                className="refund-modal-close"
                aria-label="Close"
                onClick={closeAction}
              >
                <X size={20} />
              </button>

              <span className="section-kicker">
                Administrator decision
              </span>

              <h2 id="refund-action-title">
                {modalTitle}
              </h2>

              <div className="refund-selected-booking">
                <strong>
                  {selectedRefund.booking.event_title}
                </strong>

                <span>
                  {selectedRefund.booking.reference} · KES{" "}
                  {Number(
                    selectedRefund.amount
                  ).toLocaleString("en-KE")}
                </span>
              </div>

              <div className="refund-history-reason">
                <span>Attendee reason</span>
                <p>{selectedRefund.reason}</p>
              </div>

              <div className="form-group">
                <label htmlFor="admin-note">
                  Administrator note
                  {selectedAction === "rejected" ? " *" : ""}
                </label>

                <textarea
                  id="admin-note"
                  rows="5"
                  maxLength="1000"
                  placeholder={
                    selectedAction === "rejected"
                      ? "Explain why the request is being rejected."
                      : "Add an optional message for the attendee."
                  }
                  value={adminNote}
                  onChange={(event) =>
                    setAdminNote(event.target.value)
                  }
                />
              </div>

              <div className="refund-modal-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={closeAction}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={
                    selectedAction === "rejected"
                      ? "button button-danger"
                      : "button button-primary"
                  }
                  onClick={submitAction}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Saving..."
                    : modalTitle}
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminRefunds;
