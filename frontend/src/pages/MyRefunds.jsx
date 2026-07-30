import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import api from "../api/axios";

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

  if (loading) {
    return (
      <main className="container my-events-page">
        <div className="my-events-loading">
          <span className="loading-spinner" />
          <h1>Loading refunds...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="refund-page">
      <div className="container">
        <header className="refund-page-header">
          <div>
            <span className="section-kicker">My account</span>
            <h1>Refund requests</h1>
            <p>
              Track the status of refund requests submitted for your bookings.
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
              Refund requests submitted from your confirmed bookings will
              appear here.
            </p>
          </section>
        ) : (
          <div className="refund-list">
            {refunds.map((refund) => (
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
                    {statusIcon(refund.status)}
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
                      <CalendarDays size={15} />
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
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default MyRefunds;
