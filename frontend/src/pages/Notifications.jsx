import {
  Bell,
  CalendarDays,
  CheckCheck,
  CreditCard,
  RotateCcw,
  TicketCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import Navbar from "../components/Navbar";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await api.get("/notifications");

        setNotifications(response.data.data || []);
        setUnreadCount(response.data.unread_count || 0);
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ||
            "Your notifications could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    setUpdatingId(notificationId);
    setErrorMessage("");

    try {
      const response = await api.patch(
        `/notifications/${notificationId}/read`
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? response.data.data
            : notification
        )
      );

      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "The notification could not be updated."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const markAllAsRead = async () => {
    setErrorMessage("");

    try {
      await api.patch("/notifications/read-all");

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
          read_at: notification.read_at || new Date().toISOString(),
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Notifications could not be marked as read."
      );
    }
  };

  const notificationIcon = (type) => {
    if (type === "booking") {
      return <TicketCheck size={20} />;
    }

    if (type === "payment") {
      return <CreditCard size={20} />;
    }

    if (type === "refund") {
      return <RotateCcw size={20} />;
    }

    if (type === "event") {
      return <CalendarDays size={20} />;
    }

    return <Bell size={20} />;
  };

  const notificationLink = (notification) => {
    if (notification.refund_id) {
      return "/refunds";
    }

    if (notification.booking_id) {
      return "/bookings";
    }

    if (notification.event_id) {
      return `/events/${notification.event_id}`;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />

        <main className="container my-events-page">
          <div className="my-events-loading">
            <span className="loading-spinner" />
            <h1>Loading notifications...</h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="notifications-page">
        <div className="container">
          <header className="notifications-header">
            <div>
              <span className="section-kicker">My account</span>
              <h1>Notifications</h1>
              <p>
                Stay updated on your bookings, payments, refunds and events.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="button button-secondary"
                onClick={markAllAsRead}
              >
                <CheckCheck size={17} />
                Mark all as read
              </button>
            )}
          </header>

          {errorMessage && (
            <div className="form-alert notifications-alert" role="alert">
              {errorMessage}
            </div>
          )}

          <div className="notifications-summary">
            <Bell size={21} />

            <div>
              <span>Unread notifications</span>
              <strong>{unreadCount}</strong>
            </div>
          </div>

          {notifications.length === 0 ? (
            <section className="my-events-empty">
              <span>
                <Bell size={32} />
              </span>

              <h2>No notifications yet.</h2>

              <p>
                New booking, payment and refund updates will appear here.
              </p>
            </section>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => {
                const destination = notificationLink(notification);

                return (
                  <article
                    className={`notification-card ${
                      notification.is_read
                        ? "notification-card-read"
                        : "notification-card-unread"
                    }`}
                    key={notification.id}
                  >
                    <span
                      className={`notification-icon notification-icon-${notification.type}`}
                    >
                      {notificationIcon(notification.type)}
                    </span>

                    <div className="notification-content">
                      <div className="notification-title-row">
                        <h2>{notification.title}</h2>

                        {!notification.is_read && (
                          <span className="notification-unread-dot" />
                        )}
                      </div>

                      <p>{notification.message}</p>

                      <span className="notification-time">
                        {new Date(
                          notification.created_at
                        ).toLocaleString()}
                      </span>

                      <div className="notification-actions">
                        {destination && (
                          <Link
                            to={destination}
                            className="text-link"
                            onClick={() => {
                              if (!notification.is_read) {
                                markAsRead(notification.id);
                              }
                            }}
                          >
                            View details
                          </Link>
                        )}

                        {!notification.is_read && (
                          <button
                            type="button"
                            className="notification-read-button"
                            disabled={updatingId === notification.id}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCheck size={15} />

                            {updatingId === notification.id
                              ? "Updating..."
                              : "Mark as read"}
                          </button>
                        )}
                      </div>
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

export default Notifications;
