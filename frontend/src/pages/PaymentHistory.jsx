import {
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  ReceiptText,
  RotateCcw,
  TicketCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import Navbar from "../components/Navbar";

function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadPayments = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get("/payments/me");
      setPayments(response.data.data || []);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Your payment history could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const statistics = useMemo(() => {
    const completed = payments.filter(
      (payment) => payment.status === "completed"
    );

    const refunded = payments.filter(
      (payment) => payment.status === "refunded"
    );

    const totalPaid = completed.reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    );

    return [
      {
        label: "Total payments",
        value: payments.length,
        icon: CreditCard,
        detail: "All payment records",
      },
      {
        label: "Completed",
        value: completed.length,
        icon: CheckCircle2,
        detail: "Successful transactions",
      },
      {
        label: "Total paid",
        value: `KES ${totalPaid.toLocaleString("en-KE")}`,
        icon: CircleDollarSign,
        detail: "Completed payment value",
      },
      {
        label: "Refunded",
        value: refunded.length,
        icon: RotateCcw,
        detail: "Refunded transactions",
      },
    ];
  }, [payments]);

  return (
    <div className="app-shell">
      <Navbar />

      <main className="organizer-dashboard-page">
        <section className="organizer-dashboard-hero">
          <div className="container organizer-dashboard-hero-content">
            <div>
              <span className="section-kicker">
                Attendee workspace
              </span>

              <h1>
                Payment <span>history.</span>
              </h1>

              <p>
                Review payment records, transaction references and
                booking receipts.
              </p>
            </div>

            <button
              type="button"
              className="button button-primary"
              onClick={loadPayments}
            >
              <RotateCcw size={18} />
              Refresh payments
            </button>
          </div>
        </section>

        <section className="organizer-dashboard-content">
          <div className="container">
            <div className="organizer-dashboard-tabs">
              <Link to="/attendee/dashboard">Overview</Link>
              <Link to="/bookings">My bookings</Link>

              <Link
                to="/payments"
                className="organizer-tab-active"
              >
                Payments
              </Link>

              <Link to="/refunds">Refunds</Link>
              <Link to="/notifications">Notifications</Link>
            </div>

            {errorMessage && (
              <div className="form-alert bookings-alert" role="alert">
                {errorMessage}
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
                        Transaction records
                      </span>

                      <h2>Recent payments</h2>
                    </div>

                    <Link
                      to="/bookings"
                      className="button button-secondary"
                    >
                      <TicketCheck size={17} />
                      View bookings
                    </Link>
                  </div>

                  {payments.length === 0 ? (
                    <div className="organizer-empty-state">
                      <CreditCard size={31} />

                      <h3>No payment records</h3>

                      <p>
                        Completed event payments will appear here.
                      </p>

                      <Link
                        to="/events"
                        className="button button-primary"
                      >
                        Browse events
                      </Link>
                    </div>
                  ) : (
                    <div className="organizer-table-wrapper">
                      <table className="organizer-table">
                        <thead>
                          <tr>
                            <th>Transaction</th>
                            <th>Event</th>
                            <th>Booking</th>
                            <th>Method</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Receipt</th>
                          </tr>
                        </thead>

                        <tbody>
                          {payments.map((payment) => (
                            <tr key={payment.id}>
                              <td>
                                <strong>
                                  {payment.transaction_reference}
                                </strong>
                              </td>

                              <td>
                                <strong>{payment.event_title}</strong>
                                <br />
                                <small>
                                  {payment.ticket_name} ·{" "}
                                  {payment.quantity} ticket(s)
                                </small>
                              </td>

                              <td>{payment.booking_reference}</td>

                              <td>
                                {payment.method.toUpperCase()}
                              </td>

                              <td>
                                KES{" "}
                                {Number(
                                  payment.amount
                                ).toLocaleString("en-KE")}
                              </td>

                              <td>
                                <span
                                  className={`booking-status ${
                                    payment.status === "completed"
                                      ? "booking-status-confirmed"
                                      : payment.status === "refunded"
                                        ? "booking-status-cancelled"
                                        : "booking-status-pending"
                                  }`}
                                >
                                  {payment.status}
                                </span>
                              </td>

                              <td>
                                {new Intl.DateTimeFormat("en-KE", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }).format(
                                  new Date(
                                    payment.paid_at ||
                                      payment.created_at
                                  )
                                )}
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="text-link payment-receipt-button"
                                  onClick={() =>
                                    setSelectedPayment(payment)
                                  }
                                >
                                  View receipt
                                </button>
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

        {selectedPayment && (
          <div className="refund-modal-backdrop">
            <section
              className="refund-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="payment-receipt-title"
            >
              <button
                type="button"
                className="refund-modal-close"
                aria-label="Close receipt"
                onClick={() => setSelectedPayment(null)}
              >
                <X size={20} />
              </button>

              <span className="refund-modal-icon">
                <ReceiptText size={24} />
              </span>

              <span className="section-kicker">
                Payment receipt
              </span>

              <h2 id="payment-receipt-title">
                Transaction confirmed
              </h2>

              <div className="refund-selected-booking">
                <strong>{selectedPayment.event_title}</strong>

                <span>
                  {selectedPayment.booking_reference} ·{" "}
                  {selectedPayment.ticket_name}
                </span>
              </div>

              <div className="payment-receipt-details">
                <div>
                  <span>Transaction reference</span>
                  <strong>
                    {selectedPayment.transaction_reference}
                  </strong>
                </div>

                <div>
                  <span>Payment method</span>
                  <strong>
                    {selectedPayment.method.toUpperCase()}
                  </strong>
                </div>

                <div>
                  <span>Phone number</span>
                  <strong>{selectedPayment.phone_number}</strong>
                </div>

                <div>
                  <span>Tickets</span>
                  <strong>{selectedPayment.quantity}</strong>
                </div>

                <div>
                  <span>Amount paid</span>
                  <strong>
                    KES{" "}
                    {Number(
                      selectedPayment.amount
                    ).toLocaleString("en-KE")}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{selectedPayment.status}</strong>
                </div>

                <div>
                  <span>Payment date</span>
                  <strong>
                    {new Date(
                      selectedPayment.paid_at ||
                        selectedPayment.created_at
                    ).toLocaleString("en-KE")}
                  </strong>
                </div>

                <div>
                  <span>Booking status</span>
                  <strong>
                    {selectedPayment.booking_status}
                  </strong>
                </div>
              </div>

              <div className="refund-modal-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => window.print()}
                >
                  Print receipt
                </button>

                {selectedPayment.booking_status === "confirmed" && (
                  <Link
                    to={`/tickets/${selectedPayment.booking_id}`}
                    className="button button-primary"
                  >
                    <TicketCheck size={17} />
                    Open ticket
                  </Link>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default PaymentHistory;
