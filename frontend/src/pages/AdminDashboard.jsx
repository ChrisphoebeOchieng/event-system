import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  RotateCcw,
  Store,
  TicketCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import Navbar from "../components/Navbar";

function AdminDashboard() {
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
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get("/dashboard/admin");
      setSummary(response.data.data);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "The administrator dashboard could not be loaded."
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
      label: "Total users",
      value: Number(summary?.total_users || 0).toLocaleString("en-KE"),
      icon: Users,
      detail: `${summary?.total_attendees || 0} attendees`,
    },
    {
      label: "Total events",
      value: Number(summary?.total_events || 0).toLocaleString("en-KE"),
      icon: CalendarDays,
      detail: `${summary?.published_events || 0} published`,
    },
    {
      label: "Tickets sold",
      value: Number(summary?.tickets_sold || 0).toLocaleString("en-KE"),
      icon: TicketCheck,
      detail: `${summary?.total_bookings || 0} total bookings`,
    },
  ];

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
                Welcome back,
                <span> {user?.first_name || "Administrator"}.</span>
              </h1>

              <p>
                Monitor users, events, revenue, bookings, refunds and vendor
                activity from one professional workspace.
              </p>
            </div>

            <button
              type="button"
              className="button button-primary"
              onClick={loadDashboard}
            >
              <RotateCcw size={18} />
              Refresh dashboard
            </button>
          </div>
        </section>

        <section className="organizer-dashboard-content">
          <div className="container">
            <div className="organizer-dashboard-tabs">
              <Link
                to="/admin/dashboard"
                className="organizer-tab-active"
              >
                Overview
              </Link>

              <Link to="/admin/vendors">Vendor approvals</Link>
              <Link to="/admin/refunds">Refunds</Link>
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
                <CircleDollarSign size={32} />

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
                          System activity
                        </span>

                        <h2>Account overview</h2>
                      </div>
                    </div>

                    <div className="organizer-sales-details">
                      <div>
                        <span className="organizer-sales-dot purple" />
                        <span>Attendees</span>
                        <strong>{summary?.total_attendees || 0}</strong>
                      </div>

                      <div>
                        <span className="organizer-sales-dot green" />
                        <span>Organizers</span>
                        <strong>{summary?.total_organizers || 0}</strong>
                      </div>

                      <div>
                        <span className="organizer-sales-dot purple" />
                        <span>Vendors</span>
                        <strong>{summary?.total_vendors || 0}</strong>
                      </div>

                      <div>
                        <span className="organizer-sales-dot green" />
                        <span>Pending vendor approvals</span>
                        <strong>
                          {summary?.pending_vendor_approvals || 0}
                        </strong>
                      </div>
                    </div>
                  </article>

                  <article className="organizer-sales-card">
                    <div className="organizer-card-heading">
                      <div>
                        <span className="section-kicker">
                          Administration
                        </span>

                        <h2>Action required</h2>
                      </div>
                    </div>

                    <div className="organizer-sales-ring">
                      <div>
                        <strong>
                          {(summary?.pending_refunds || 0) +
                            (summary?.pending_vendor_approvals || 0)}
                        </strong>

                        <span>pending</span>
                      </div>
                    </div>

                    <div className="organizer-sales-details">
                      <div>
                        <span className="organizer-sales-dot purple" />
                        <span>Pending refunds</span>
                        <strong>{summary?.pending_refunds || 0}</strong>
                      </div>

                      <div>
                        <span className="organizer-sales-dot green" />
                        <span>Vendor approvals</span>
                        <strong>
                          {summary?.pending_vendor_approvals || 0}
                        </strong>
                      </div>
                    </div>
                  </article>
                </section>

                <section className="organizer-bookings-card">
                  <div className="organizer-card-heading">
                    <div>
                      <span className="section-kicker">
                        Recent activity
                      </span>

                      <h2>Latest bookings</h2>
                    </div>

                    <Link
                      to="/admin/refunds"
                      className="button button-secondary"
                    >
                      Manage refunds
                    </Link>
                  </div>

                  {!summary?.recent_bookings?.length ? (
                    <div className="organizer-empty-state">
                      <TicketCheck size={31} />

                      <h3>No bookings yet</h3>

                      <p>
                        Recent customer bookings will appear here.
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
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>

                        <tbody>
                          {summary.recent_bookings.map((booking) => (
                            <tr key={booking.id}>
                              <td>
                                <strong>{booking.reference}</strong>
                              </td>

                              <td>{booking.event_title}</td>
                              <td>{booking.attendee}</td>
                              <td>{booking.quantity}</td>

                              <td>
                                KES{" "}
                                {Number(booking.amount).toLocaleString(
                                  "en-KE"
                                )}
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

                <section className="organizer-bookings-card">
                  <div className="organizer-card-heading">
                    <div>
                      <span className="section-kicker">
                        Event management
                      </span>

                      <h2>Recently created events</h2>
                    </div>
                  </div>

                  {!summary?.recent_events?.length ? (
                    <div className="organizer-empty-state">
                      <CalendarDays size={31} />

                      <h3>No events available</h3>

                      <p>Recently created events will appear here.</p>
                    </div>
                  ) : (
                    <div className="organizer-table-wrapper">
                      <table className="organizer-table">
                        <thead>
                          <tr>
                            <th>Event</th>
                            <th>Organizer</th>
                            <th>Status</th>
                            <th>Capacity</th>
                            <th>Tickets remaining</th>
                            <th>Start date</th>
                          </tr>
                        </thead>

                        <tbody>
                          {summary.recent_events.map((event) => (
                            <tr key={event.id}>
                              <td>
                                <strong>{event.title}</strong>
                              </td>

                              <td>{event.organizer}</td>

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

                              <td>{event.capacity}</td>
                              <td>{event.tickets_remaining}</td>

                              <td>
                                {new Intl.DateTimeFormat("en-KE", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }).format(new Date(event.start_date))}
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

export default AdminDashboard;
