import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  Phone,
  ShieldCheck,
  TicketCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";
import Navbar from "../components/Navbar";

function Checkout() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentState, setPaymentState] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const latestBooking = localStorage.getItem("latest_booking");

    if (!latestBooking) {
      setMessage("Booking information could not be found.");
      setPaymentState("error");
      return;
    }

    const parsedBooking = JSON.parse(latestBooking);

    if (parsedBooking.id !== bookingId) {
      setMessage("This booking does not match your current session.");
      setPaymentState("error");
      return;
    }

    setBooking(parsedBooking);
  }, [bookingId]);

  const handlePayment = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!/^0[17]\d{8}$/.test(phoneNumber)) {
      setMessage("Enter a valid Kenyan phone number.");
      return;
    }

    setPaymentState("loading");

    try {
      const response = await api.post("/payments", {
        booking_id: bookingId,
        phone_number: phoneNumber,
        method: "mpesa",
      });

      localStorage.setItem(
        "latest_payment",
        JSON.stringify(response.data.data)
      );

      setPaymentState("success");
      setMessage("Payment completed successfully.");
    } catch (error) {
      setPaymentState("error");
      setMessage(
        error.response?.data?.message ||
          "Payment could not be completed. Please try again."
      );
    }
  };

  if (!booking && paymentState !== "error") {
    return (
      <div className="app-shell">
        <Navbar />

        <main className="checkout-page">
          <div className="checkout-loading">
            Loading checkout...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="checkout-page">
        <div className="container checkout-container">
          <Link to="/" className="checkout-back">
            <ArrowLeft size={17} />
            Continue browsing
          </Link>

          <div className="checkout-heading">
            <span className="section-kicker">Secure checkout</span>
            <h1>Complete your booking.</h1>
            <p>
              Review your order and confirm payment using M-Pesa.
            </p>
          </div>

          {paymentState === "success" ? (
            <section className="payment-success-card">
              <span className="payment-success-icon">
                <CheckCircle2 size={38} />
              </span>

              <span className="section-kicker">Payment confirmed</span>
              <h2>Your ticket is secured.</h2>

              <p>
                Booking <strong>{booking?.booking_reference}</strong> has been
                confirmed successfully.
              </p>

              <div className="payment-success-reference">
                <span>Amount paid</span>
                <strong>
                  KES {Number(booking?.total_amount).toLocaleString("en-KE")}
                </strong>
              </div>

              <button
                type="button"
                className="button button-primary"
                onClick={() => navigate("/bookings")}
              >
                View my bookings
              </button>
            </section>
          ) : (
            <div className="checkout-grid">
              <section className="checkout-payment-card">
                <div className="checkout-card-heading">
                  <span className="checkout-icon">
                    <CreditCard size={21} />
                  </span>

                  <div>
                    <h2>Payment details</h2>
                    <p>Pay securely through M-Pesa.</p>
                  </div>
                </div>

                <form className="checkout-form" onSubmit={handlePayment}>
                  <div className="form-group">
                    <label htmlFor="phone_number">
                      M-Pesa phone number
                    </label>

                    <div className="input-shell">
                      <Phone size={18} />

                      <input
                        id="phone_number"
                        type="tel"
                        placeholder="0712345678"
                        value={phoneNumber}
                        onChange={(event) =>
                          setPhoneNumber(event.target.value.trim())
                        }
                      />
                    </div>

                    <span className="checkout-helper">
                      Use the number registered with M-Pesa.
                    </span>
                  </div>

                  {message && (
                    <div
                      className={`checkout-message checkout-message-${paymentState}`}
                    >
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="button button-primary checkout-pay-button"
                    disabled={paymentState === "loading"}
                  >
                    {paymentState === "loading"
                      ? "Processing payment..."
                      : `Pay KES ${Number(
                          booking?.total_amount || 0
                        ).toLocaleString("en-KE")}`}
                  </button>

                  <div className="checkout-security-note">
                    <LockKeyhole size={15} />
                    Your payment information is encrypted and protected.
                  </div>
                </form>
              </section>

              <aside className="checkout-summary-card">
                <span className="section-kicker">Order summary</span>

                <div className="checkout-ticket-preview">
                  <span className="checkout-ticket-icon">
                    <TicketCheck size={22} />
                  </span>

                  <div>
                    <strong>{booking?.booking_reference}</strong>
                    <p>Confirmed after successful payment</p>
                  </div>
                </div>

                <div className="checkout-summary-list">
                  <div>
                    <span>Tickets</span>
                    <strong>{booking?.quantity}</strong>
                  </div>

                  <div>
                    <span>Price per ticket</span>
                    <strong>
                      KES{" "}
                      {Number(booking?.unit_price).toLocaleString("en-KE")}
                    </strong>
                  </div>

                  <div className="checkout-summary-total">
                    <span>Total</span>
                    <strong>
                      KES{" "}
                      {Number(booking?.total_amount).toLocaleString("en-KE")}
                    </strong>
                  </div>
                </div>

                <div className="checkout-protection">
                  <ShieldCheck size={20} />

                  <div>
                    <strong>Buyer protection</strong>
                    <p>
                      Your booking is protected until payment is confirmed.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Checkout;
