import {
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesCombined,
  CircleDollarSign,
  Plus,
  RotateCcw,
  TicketCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";
import Navbar from "../components/Navbar";

function Dashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const loadDashboard = async () => {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get("/dashboard/organizer");
      setSummary(response.data.data);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }

      setErrorMessage(
        error.response?.data?.message ||
          "We couldn't load your dashboard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const statistics = [
    {
      label: "Total revenue",
      value: `KES ${Number(
        summary?.total_revenue || 0
      ).toLocaleString("en-KE")}`,
      icon: CircleDollarSign,
      detail: `${summary?.confirmed_bookings || 0} confirmed bookings`,
    },
    {
      label: "Tickets sold",
      value: Number(
        summary?.tickets_sold || 0
      ).toLocaleString("en-KE"),
      icon: TicketCheck,
      detail: `${summary?.active_ticket_types || 0} active ticket tiers`,
    },
    {
      label: "Total bookings",
      value: Number(
        summary?.total_bookings || 0
      ).toLocaleString("en-KE"),
      icon: Users,
      detail: "Across all your events",
    },
    {
      label: "Published events",
      value: Number(
        summary?.published_events || 0
      ).toLocaleString("en-KE"),
      icon: CalendarDays,
      detail: `${summary?.total_events || 0} total events`,
    },
  ];

  const salesPercentage =
    summary?.total_bookings > 0
      ? Math.round(
          (Number(summary.confirmed_bookings || 0) /
            Number(summary.total_bookings)) *
            100
        )
      : 0;

  return (
    <div className="app-shell">
      <Navbar />

      <main className="organizer-dashboard-page">
        <section className="organizer-dashboard-hero">
          <div className="container organizer-dashboard-hero-content">
            <div>
              <span className="section-kicker">
                Organizer workspace
              </span>

              <h1>
                Welcome back,
                <span> {user?.first_name || "Organizer"}.</span>
              </h1>

              <p>
                Track revenue, ticket sales, customer bookings and event
                performance from one professional workspace.
              </p>
            </div>

            <div className="booking-ticket-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={loadDashboard}
              >
                <RotateCcw size={18} />
                Refresh
              </button>

              <Link
                to="/dashboard/events/create"
                className="button button-primary"
              >
                <Plus size={18} />
                Create event
              </Link>
            </div>
          </div>
        </section>

        <section className="organizer-dashboard-content">
          <div className="container">
            <div className="organizer-dashboard-tabs">
              <Link
                to="/dashboard"
                className="organizer-tab-active"
              >
                Overview
              </Link>

              <Link to="/dashboard/events">My events</Link>
              <Link to="/dashboard">Bookings</Link>
              <Link to="/notifications">Notifications</Link>
            </div>

            {loading && (
              <div className="organizer-stat-grid">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="organizer-stat-card organizer-loading-card"
                  />
                ))}
              </div>
            )}

            {!loading && errorMessage && (
              <div className="organizer-dashboard-error">
                <ChartNoAxesCombined size={32} />

                <h2>Dashboard unavailable</h2>
                <p>{errorMessage}</p>

                <button
                  type="button"
                  className="button button-primary"
                  onClick={loadDashboard}
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !errorMessage && (
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

                          <ArrowUpRight size={17} />
                        </div>

                        <p>{statistic.label}</p>
                        <strong>{statistic.value}</strong>
                        <small>{statistic.detail}</small>
                      </article>
                    );
                  })}
                </section>

                <section className="organizer-dashboard-grid">
                  <article className="organizer-revenue-card">
                    <div className="organizer-card-heading">
                      <div>
                        <span className="section-kicker">
                          Financial performance
                        </span>

                        <h2>Revenue overview</h2>
                      </div>
                    </div>

                    <div className="organizer-revenue-summary">
                      <div>
                        <span>Gross revenue</span>

                        <strong>
                          KES{" "}
                          {Number(
                            summary?.total_revenue || 0
                          ).toLocaleString("en-KE")}
                        </strong>
                      </div>

                      <span>Live data</span>
                    </div>

                    <div className="organizer-sales-details">
                      <div>
                        <span className="organizer-sales-dot purple" />
                        <span>Completed payments</span>
                        <strong>
                          {summary?.confirmed_bookings || 0}
                        </strong>
                      </div>

                      <div>
                        <span className="organizer-sales-dot green" />
                        <span>Refunded amount</span>
                        <strong>
                          KES{" "}
                          {Number(
                            summary?.refunded_amount || 0
                          ).toLocaleString("en-KE")}
                        </strong>
                      </div>
                    </div>

                    <div className="organizer-revenue-chart">
                      {[44, 68, 55, 84, 66, 102, 88, 116, 94, 125, 108, 136].map(
                        (height, index) => (
                          <span
                            key={index}
                            style={{ height: `${height}px` }}
                          />
                        )
                      )}
                    </div>

                    <div className="organizer-chart-labels">
                      <span>Jan</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                      <span>Jul</span>
                    </div>
                  </article>

                  <article className="organizer-sales-card">
                    <div className="organizer-card-heading">
                      <div>
                        <span className="section-kicker">
                          Booking conversion
                        </span>

                        <h2>Confirmed sales</h2>
                      </div>
                    </div>

                    <div
                      className="organizer-sales-ring"
                      style={{
                        background: `conic-gradient(
                          #6c193e ${salesPercentage}%,
                          #eee5e9 ${salesPercentage}% 100%
                        )`,
                      }}
                    >
                      <div>
                        <strong>{salesPercentage}%</strong>
                        <span>confirmed</span>
                      </div>
                    </div>

                    <div className="organizer-sales-details">
                      <div>
                        <span className="organizer-sales-dot purple" />
                        <span>Confirmed bookings</span>
                        <strong>
                          {summary?.confirmed_bookings || 0}
                        </strong>
                      </div>

                      <div>
                        <span className="organizer-sales-dot green" />
                        <span>Total bookings</span>
                        <strong>
                          {summary?.total_bookings || 0}
                        </strong>
                      </div>
                    </div>
                  </article>
                </section>

                <section className="organizer-bookings-card">
                  <div className="organizer-card-heading">
                    <div>
                      <span className="section-kicker">
                        Event performance
                      </span>

                      <h2>Your event results</h2>
                    </div>

                    <Link
                      to="/dashboard/events"
                      className="button button-secondary"
                    >
                      Manage events
                    </Link>
                  </div>

                  {!summary?.event_performance?.length ? (
                    <div className="organizer-empty-state">
                      <CalendarDays size={31} />

                      <h3>No events yet</h3>

                      <p>
                        Create your first event to start tracking
                        performance.
                      </p>

                      <Link
                        to="/dashboard/events/create"
                        className="button button-primary"
                      >
                        Create event
                      </Link>
                    </div>
                  ) : (
                    <div className="organizer-table-wrapper">
                      <table className="organizer-table">
                        <thead>
                          <tr>
                            <th>Event</th>
                            <th>Status</th>
                            <th>Tickets sold</th>
                            <th>Remaining</th>
                            <th>Revenue</th>
                            <th>Start date</th>
                            <th>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {summary.event_performance.map((event) => (
                            <tr key={event.id}>
                              <td>
                                <strong>{event.title}</strong>
                              </td>

                              <td>
                                <span
                                  className={`booking-status booking-status-${
                                    event.status === "published"
                                      ? "confirmed"
                                      : event.status === "cancelled"
                                        ? "cancelled"
                                        : "pending"
                                  }`}
                                >
                                  {event.status}
                                </span>
                              </td>

                              <td>
                                {event.tickets_sold} / {event.capacity}
                              </td>

                              <td>{event.tickets_remaining}</td>

                              <td>
                                KES{" "}
                                {Number(event.revenue).toLocaleString(
                                  "en-KE"
                                )}
                              </td>

                              <td>
                                {new Intl.DateTimeFormat("en-KE", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }).format(new Date(event.start_date))}
                              </td>

                              <td>
                                <Link
                                  to={`/dashboard/events/${event.id}/edit`}
                                  className="text-link"
                                >
                                  Manage
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section className="organizer-bookings-card">
                  <div className="organizer-card-heading">
                    <div>
                      <span className="section-kicker">
                        Recent activity
                      </span>

                      <h2>Latest customer bookings</h2>
                    </div>
                  </div>

                  {!summary?.recent_bookings?.length ? (
                    <div className="organizer-empty-state">
                      <TicketCheck size={31} />

                      <h3>No bookings yet</h3>

                      <p>
                        Customer bookings for your events will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="organizer-table-wrapper">
                      <table className="organizer-table">
                        <thead>
                          <tr>
                            <th>Reference</th>
                            <th>Event</th>
                            <th>Attendee</th>
                            <th>Tickets</th>
                            <th>Amount</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>

                        <tbody>
                          {summary.recent_bookings.map((booking) => (
                            <tr key={booking.id}>
                              <td>
                                <strong>
                                  {booking.booking_reference}
                                </strong>
                              </td>

                              <td>{booking.event_title}</td>
                              <td>{booking.attendee}</td>
                              <td>{booking.quantity}</td>

                              <td>
                                KES{" "}
                                {Number(
                                  booking.total_amount
                                ).toLocaleString("en-KE")}
                              </td>

                              <td>
                                {booking.payment_status || "not paid"}
                              </td>

                              <td>
                                <span
                                  className={`booking-status booking-status-${booking.status}`}
                                >
                                  {booking.status}
                                </span>
                              </td>

                              <td>
                                {new Intl.DateTimeFormat("en-KE", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }).format(
                                  new Date(booking.created_at)
                                )}
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
      </main>
    </div>
  );
}

export default Dashboard;
