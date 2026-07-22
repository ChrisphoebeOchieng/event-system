import {
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesCombined,
  CircleDollarSign,
  Plus,
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
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      navigate("/login");
      return;
    }

    async function loadDashboard() {
      try {
        const [summaryResponse, bookingsResponse] = await Promise.all([
          api.get("/dashboard/organizer"),
          api.get("/bookings/me"),
        ]);

        setSummary(summaryResponse.data.data);
        setBookings(bookingsResponse.data.data || []);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/login");
          return;
        }

        setErrorMessage(
          "We couldn't load your dashboard. Please try again shortly."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  const statistics = [
    {
      label: "Total revenue",
      value: `KES ${Number(summary?.total_revenue || 0).toLocaleString(
        "en-KE"
      )}`,
      icon: CircleDollarSign,
      detail: "Completed payments",
    },
    {
      label: "Tickets sold",
      value: Number(summary?.tickets_sold || 0).toLocaleString("en-KE"),
      icon: TicketCheck,
      detail: "Confirmed bookings",
    },
    {
      label: "Total bookings",
      value: Number(summary?.total_bookings || 0).toLocaleString("en-KE"),
      icon: Users,
      detail: "Across your events",
    },
    {
      label: "Total events",
      value: Number(summary?.total_events || 0).toLocaleString("en-KE"),
      icon: CalendarDays,
      detail: `${summary?.active_ticket_types || 0} active ticket tiers`,
    },
  ];

  return (
    <div className="app-shell">
      <Navbar />

      <main className="organizer-dashboard-page">
        <section className="organizer-dashboard-hero">
          <div className="container organizer-dashboard-hero-content">
            <div>
              <span className="section-kicker">Organizer workspace</span>

              <h1>
                Welcome back,
                <span> {user?.first_name || "Organizer"}.</span>
              </h1>

              <p>
                Track revenue, ticket sales, bookings and event performance
                from one professional workspace.
              </p>
            </div>

            <Link
              to="/dashboard/events/create"
              className="button button-primary"
            >
              <Plus size={18} />
              Create event
            </Link>
          </div>
        </section>

        <section className="organizer-dashboard-content">
          <div className="container">
            <div className="organizer-dashboard-tabs">
              <Link to="/dashboard" className="organizer-tab-active">
                Overview
              </Link>

              <Link to="/dashboard/events">My events</Link>

              <Link to="/dashboard">Bookings</Link>

              <Link to="/dashboard">Attendees</Link>
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
                  onClick={() => window.location.reload()}
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
                        <span className="section-kicker">Performance</span>
                        <h2>Revenue overview</h2>
                      </div>

                      <select defaultValue="7">
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                      </select>
                    </div>

                    <div className="organizer-revenue-summary">
                      <div>
                        <span>Total revenue</span>

                        <strong>
                          KES{" "}
                          {Number(summary?.total_revenue || 0).toLocaleString(
                            "en-KE"
                          )}
                        </strong>
                      </div>

                      <span>Live data</span>
                    </div>

                    <div className="organizer-revenue-chart">
                      {[38, 56, 48, 69, 61, 83, 72, 94, 82, 108, 91, 122].map(
                        (height, index) => (
                          <span
                            key={index}
                            style={{ height: `${height}px` }}
                          />
                        )
                      )}
                    </div>

                    <div className="organizer-chart-labels">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </article>

                  <article className="organizer-sales-card">
                    <div className="organizer-card-heading">
                      <div>
                        <span className="section-kicker">Ticket sales</span>
                        <h2>Sales progress</h2>
                      </div>
                    </div>

                    <div className="organizer-sales-ring">
                      <div>
                        <strong>{summary?.tickets_sold || 0}</strong>
                        <span>sold</span>
                      </div>
                    </div>

                    <div className="organizer-sales-details">
                      <div>
                        <span className="organizer-sales-dot purple" />
                        <span>Confirmed tickets</span>
                        <strong>{summary?.tickets_sold || 0}</strong>
                      </div>

                      <div>
                        <span className="organizer-sales-dot green" />
                        <span>Active ticket tiers</span>
                        <strong>{summary?.active_ticket_types || 0}</strong>
                      </div>
                    </div>
                  </article>
                </section>

                <section className="organizer-bookings-card">
                  <div className="organizer-card-heading">
                    <div>
                      <span className="section-kicker">Recent activity</span>
                      <h2>Latest bookings</h2>
                    </div>

                    <button type="button" className="button button-secondary">
                      View all
                    </button>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="organizer-empty-state">
                      <TicketCheck size={31} />

                      <h3>No bookings yet</h3>

                      <p>Your latest customer bookings will appear here.</p>
                    </div>
                  ) : (
                    <div className="organizer-table-wrapper">
                      <table className="organizer-table">
                        <thead>
                          <tr>
                            <th>Reference</th>
                            <th>Tickets</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>

                        <tbody>
                          {bookings.slice(0, 6).map((booking) => (
                            <tr key={booking.id}>
                              <td>
                                <strong>{booking.booking_reference}</strong>
                              </td>

                              <td>{booking.quantity}</td>

                              <td>
                                KES{" "}
                                {Number(booking.total_amount).toLocaleString(
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
                                }).format(new Date(booking.created_at))}
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
