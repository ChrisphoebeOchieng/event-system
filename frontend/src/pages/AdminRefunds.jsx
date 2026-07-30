import {
  CheckCircle2,
  Clock3,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import api from "../api/axios";

function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadRefunds() {
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
    }

    loadRefunds();
  }, []);

  const updateRefund = async (refund, status) => {
    const adminNote =
      status === "rejected"
        ? window.prompt("Reason for rejecting this refund:")
        : window.prompt(
            "Optional administrator note:",
            refund.admin_note || ""
          );

    if (status === "rejected" && !adminNote?.trim()) {
      return;
    }

    setActionId(refund.id);
    setErrorMessage("");

    try {
      const response = await api.patch(
        `/admin/refunds/${refund.id}`,
        {
          status,
          admin_note: adminNote?.trim() || null,
        }
      );

      setRefunds((current) =>
        current.map((item) =>
          item.id === refund.id ? response.data.data : item
        )
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "The refund status could not be updated."
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
          <h1>Loading refund requests...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="refund-page">
      <div className="container">
        <header className="refund-page-header">
          <div>
            <span className="section-kicker">
              Administrator workspace
            </span>

            <h1>Refund management</h1>

            <p>
              Review, approve, reject and complete attendee refund requests.
            </p>
          </div>

          <div className="refund-summary">
            <RotateCcw size={22} />

            <div>
              <span>Total requests</span>
              <strong>{refunds.length}</strong>
            </div>
          </div>
        </header>

        {errorMessage && (
          <div className="form-alert" role="alert">
            {errorMessage}
          </div>
        )}

        {refunds.length === 0 ? (
          <section className="my-events-empty">
            <span>
              <RotateCcw size={32} />
            </span>

            <h2>No refund requests yet.</h2>

            <p>
              Submitted refund requests will appear here for review.
            </p>
          </section>
        ) : (
          <div className="refund-list">
            {refunds.map((refund) => {
              const isProcessing = actionId === refund.id;

              return (
                <article className="refund-card" key={refund.id}>
                  <div className="refund-card-top">
                    <div>
                      <span className="refund-reference">
                        {refund.booking.reference}
                      </span>

                      <h2>{refund.booking.event_title}</h2>

                      <p>
                        {refund.booking.ticket_name} ·{" "}
                        {refund.booking.quantity} ticket(s)
                      </p>
                    </div>

                    <span
                      className={`refund-status refund-status-${refund.status}`}
                    >
                      {refund.status === "pending" ? (
                        <Clock3 size={18} />
                      ) : refund.status === "rejected" ? (
                        <XCircle size={18} />
                      ) : (
                        <CheckCircle2 size={18} />
                      )}

                      {refund.status}
                    </span>
                  </div>

                  <div className="refund-card-body">
                    <div>
                      <span>Amount</span>
                      <strong>KES {refund.amount}</strong>
                    </div>

                    <div>
                      <span>Requested</span>
                      <strong>
                        {new Date(
                          refund.requested_at
                        ).toLocaleDateString()}
                      </strong>
                    </div>
                  </div>

                  <div className="refund-reason">
                    <span>Reason</span>
                    <p>{refund.reason}</p>
                  </div>

                  {refund.admin_note && (
                    <div className="refund-admin-note">
                      <span>Administrator note</span>
                      <p>{refund.admin_note}</p>
                    </div>
                  )}

                  <div className="refund-actions">
                    {refund.status === "pending" && (
                      <>
                        <button
                          type="button"
                          className="button button-primary"
                          disabled={isProcessing}
                          onClick={() =>
                            updateRefund(refund, "approved")
                          }
                        >
                          <CheckCircle2 size={17} />
                          Approve
                        </button>

                        <button
                          type="button"
                          className="button button-danger"
                          disabled={isProcessing}
                          onClick={() =>
                            updateRefund(refund, "rejected")
                          }
                        >
                          <XCircle size={17} />
                          Reject
                        </button>
                      </>
                    )}

                    {refund.status === "approved" && (
                      <button
                        type="button"
                        className="button button-primary"
                        disabled={isProcessing}
                        onClick={() =>
                          updateRefund(refund, "completed")
                        }
                      >
                        <CheckCircle2 size={17} />
                        Complete refund
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminRefunds;
