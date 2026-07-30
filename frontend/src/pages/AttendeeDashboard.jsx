import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  CircleDollarSign,
  RotateCcw,
  TicketCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import Navbar from "../components/Navbar";

function AttendeeDashboard() {
  const [bookings, setBookings] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
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
      const [
        bookingsResponse,
        refundsResponse,
        notificationsResponse,
      ] = await Promise.all([
        api.get("/bookings/me"),
        api.get("/refunds/me"),
        api.get("/notifications"),
      ]);

      setBookings(bookingsResponse.data.data || []);
      setRefunds(refundsResponse.data.data || []);
      setNotifications(notificationsResponse.data.data || []);
      setUnreadCount(
        notificationsResponse.data.unread_count || 0
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Your dashboard could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed"
  );

  const upcomingBookings = confirmedBookings.filter(
    (booking) =>
      new Date(booking.event_date).getTime() >= Date.now()
  );

  const totalSpent = confirmedBookings.reduce(
    (total, booking) =>
      total + Number(booking.total_amount || 0),
    0
  );

  const pendingRefunds = refunds.filter(
    (refund) => refund.status === "pending"
  ).length;

  const statistics = [
    {
      label: "Confirmed bookings",
      value: confirmedBookings.length,
      icon: TicketCheck,
      detail: `${bookings.length} total bookings`,
    },
    {
      label: "Upcoming events",
      value: upcomingBookings.length,
      icon: CalendarDays,
      detail: "Confirmed future events",
    },
    {
      label: "Total spent",
      value: `KES ${totalSpent.toLocaleString("en-KE")}`,
      icon: CircleDollarSign,
      detail: "Across confirmed bookings",
    },
    {
      label: "Unread updates",
      value: unreadCount,
      icon: Bell,
      detail: `${pendingRefunds} pending refunds`,
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
                Attendee workspace
              </span>

              <h1>
                Welcome back,
                <span> {user?.first_name || "Attendee"}.</span>
              </h1>

              <p>
                Manage your bookings, upcoming events, refunds and
                notifications from one professional workspace.
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
                to="/events"
                className="button button-primary"
              >
                <CalendarDays size={18} />
                Browse events
              </Link>
            </div>
          </div>
        </section>

        <section className="organizer-dashboard-content">
          <div className="container">
            <div className="organizer-dashboard-tabs">
              <Link
                to="/attendee/dashboard"
                className="organizer-tab-active"
              >
                Overview
              </Link>

              <Link to="/bookings">My bookings</Link>
              <Link to="/refunds">Refunds</Link>
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
                <TicketCheck size={32} />
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
                          Upcoming experiences
                        </span>
                        <h2>Your next events</h2>
                      </div>

                      <Link
                        to="/bookings"
                        className="button button-secondary"
                      >
                        View all
                      </Link>
                    </div>

                    {upcomingBookings.length === 0 ? (
                      <div className="organizer-empty-state">
                        <CalendarDays size={31} />
                        <h3>No upcoming events</h3>
                        <p>
                          Explore available events and reserve your
                          next experience.
                        </p>
                      </div>
                    ) : (
                      <div className="attendee-upcoming-list">
                        {upcomingBookings
                          .slice(0, 3)
                          .map((booking) => (
                            <article
                              className="attendee-upcoming-card"
                              key={booking.id}
                            >
                              {booking.event_image ? (
                                <img
                                  src={booking.event_image}
                                  alt={booking.event_title}
                                />
                              ) : (
                                <div className="attendee-upcoming-placeholder">
                                  <TicketCheck size={28} />
                                </div>
                              )}

                              <div>
                                <span className="booking-reference">
                                  {booking.booking_reference}
                                </span>

                                <h3>{booking.event_title}</h3>

                                <p>
                                  {new Intl.DateTimeFormat(
                                    "en-KE",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  ).format(
                                    new Date(booking.event_date)
                                  )}
                                </p>

                                <small>
                                  {booking.event_venue},{" "}
                                  {booking.event_city}
                                </small>
                              </div>
                            </article>
                          ))}
                      </div>
                    )}
                  </article>

                  <article className="organizer-sales-card">
                    <div className="organizer-card-heading">
                      <div>
                        <span className="section-kicker">
                          Account activity
                        </span>
                        <h2>Booking summary</h2>
                      </div>
                    </div>

                    <div className="organizer-sales-ring">
                      <div>
                        <strong>{confirmedBookings.length}</strong>
                        <span>confirmed</span>
                      </div>
                    </div>

                    <div className="organizer-sales-details">
                      <div>
                        <span className="organizer-sales-dot purple" />
                        <span>Total bookings</span>
                        <strong>{bookings.length}</strong>
                      </div>

                      <div>
                        <span className="organizer-sales-dot green" />
                        <span>Refund requests</span>
                        <strong>{refunds.length}</strong>
                      </div>
                    </div>
                  </article>
                </section>

                <section className="organizer-bookings-card">
                  <div className="organizer-card-heading">
                    <div>
                      <span className="section-kicker">
                        Recent updates
                      </span>
                      <h2>Latest notifications</h2>
                    </div>

                    <Link
                      to="/notifications"
                      className="button button-secondary"
                    >
                      View notifications
                    </Link>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="organizer-empty-state">
                      <Bell size={31} />
                      <h3>No notifications yet</h3>
                      <p>
                        Booking, payment and refund updates will appear
                        here.
                      </p>
                    </div>
                  ) : (
                    <div className="attendee-notification-list">
                      {notifications.slice(0, 5).map(
                        (notification) => (
                          <article
                            className={
                              notification.is_read
                                ? "attendee-notification-row"
                                : "attendee-notification-row unread"
                            }
                            key={notification.id}
                          >
                            <span className="organizer-stat-icon">
                              <Bell size={18} />
                            </span>

                            <div>
                              <strong>{notification.title}</strong>
                              <p>{notification.message}</p>
                              <small>
                                {new Date(
                                  notification.created_at
                                ).toLocaleString("en-KE")}
                              </small>
                            </div>
                          </article>
                        )
                      )}
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

export default AttendeeDashboard;
