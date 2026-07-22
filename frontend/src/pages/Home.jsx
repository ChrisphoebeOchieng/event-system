import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronRight,
  CreditCard,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TicketCheck,
  Users,
  WalletCards,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import EventCard from "../components/EventCard";
import Navbar from "../components/Navbar";

const categories = [
  { name: "Music", icon: "♪", count: "Live shows" },
  { name: "Nightlife", icon: "✦", count: "Parties" },
  { name: "Business", icon: "↗", count: "Networking" },
  { name: "Technology", icon: "⌘", count: "Conferences" },
  { name: "Fashion", icon: "◌", count: "Experiences" },
  { name: "Food", icon: "◇", count: "Festivals" },
];

const benefits = [
  {
    icon: Smartphone,
    title: "Built for mobile",
    description:
      "Discover and purchase tickets smoothly from any device, wherever you are.",
  },
  {
    icon: WalletCards,
    title: "Local payments",
    description:
      "A checkout experience designed around M-Pesa, cards and African customers.",
  },
  {
    icon: QrCode,
    title: "Secure entry",
    description:
      "Unique digital tickets and fast QR verification for safer event access.",
  },
];

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventError, setEventError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await api.get("/events/");
        setEvents(response.data.data || []);
      } catch {
        setEventError(
          "Events are temporarily unavailable. Please check again shortly."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  return (
    <div className="app-shell">
      <Navbar />

      <main>
        <section className="hero-section">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />

          <div className="container hero-grid">
            <div className="hero-content">
              <div className="eyebrow">
                <span className="eyebrow-icon">
                  <Sparkles size={15} />
                </span>
                Africa’s next unforgettable experience
              </div>

              <h1>
                Find your next
                <span> unforgettable moment.</span>
              </h1>

              <p className="hero-description">
                Discover concerts, parties, festivals, conferences and cultural
                experiences—then book securely in minutes.
              </p>

              <div className="hero-search">
                <div className="hero-search-field">
                  <Search size={20} />

                  <input
                    type="search"
                    placeholder="Search events, artists or venues"
                    aria-label="Search events"
                  />
                </div>

                <div className="hero-search-divider" />

                <div className="hero-search-field location-field">
                  <MapPin size={20} />

                  <select aria-label="Select location" defaultValue="Nairobi">
                    <option>Nairobi</option>
                    <option>Mombasa</option>
                    <option>Kisumu</option>
                    <option>All locations</option>
                  </select>
                </div>

                <button className="button button-primary hero-search-button">
                  Explore events
                  <ArrowRight size={18} />
                </button>
              </div>

              <div className="hero-trust">
                <div className="attendee-avatars">
                  <span>PO</span>
                  <span>AM</span>
                  <span>JK</span>
                  <span>+</span>
                </div>

                <div>
                  <div className="hero-rating">
                    <strong>Trusted experiences</strong>
                    <BadgeCheck size={16} />
                  </div>
                  <p>Secure bookings and instant confirmation</p>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-poster">
                <img
                  src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a"
                  alt="Crowd enjoying a live event"
                />

                <div className="hero-poster-overlay" />

                <div className="poster-top">
                  <span className="live-pill">
                    <span />
                    Trending
                  </span>

                  <span className="poster-date">
                    <strong>15</strong>
                    AUG
                  </span>
                </div>

                <div className="poster-content">
                  <p>Nairobi presents</p>
                  <h2>Summer Fest</h2>

                  <div className="poster-location">
                    <MapPin size={16} />
                    Uhuru Gardens, Nairobi
                  </div>
                </div>
              </div>

              <div className="floating-card floating-sales">
                <span className="floating-icon">
                  <ChartNoAxesCombined size={19} />
                </span>

                <div>
                  <p>Tickets selling</p>
                  <strong>Live analytics</strong>
                </div>

                <span className="positive-change">+24%</span>
              </div>

              <div className="floating-card floating-secure">
                <ShieldCheck size={22} />
                <div>
                  <strong>Secure checkout</strong>
                  <p>M-Pesa & cards</p>
                </div>
              </div>
            </div>
          </div>

          <div className="container hero-statistics">
            <div>
              <strong>Fast</strong>
              <span>event discovery</span>
            </div>
            <div>
              <strong>Secure</strong>
              <span>digital payments</span>
            </div>
            <div>
              <strong>Instant</strong>
              <span>ticket confirmation</span>
            </div>
            <div>
              <strong>Real-time</strong>
              <span>organizer analytics</span>
            </div>
          </div>
        </section>

        <section className="section categories-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Explore your interests</span>
                <h2>There’s always something happening.</h2>
              </div>

              <Link to="/events" className="text-link large">
                View all categories
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="category-grid">
              {categories.map((category) => (
                <Link
                  to={`/events?category=${category.name}`}
                  className="category-card"
                  key={category.name}
                >
                  <span className="category-icon">{category.icon}</span>

                  <div>
                    <h3>{category.name}</h3>
                    <p>{category.count}</p>
                  </div>

                  <ChevronRight size={18} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section events-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Curated for you</span>
                <h2>Events worth leaving the house for.</h2>
              </div>

              <Link to="/events" className="button button-secondary">
                Browse all events
                <ArrowRight size={17} />
              </Link>
            </div>

            {loading && (
              <div className="event-grid">
                {[1, 2, 3].map((item) => (
                  <div className="event-card event-skeleton" key={item}>
                    <div className="skeleton-image" />
                    <div className="skeleton-content">
                      <span />
                      <strong />
                      <p />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && eventError && (
              <div className="state-card">
                <CalendarDays size={30} />
                <h3>We’re preparing something exciting.</h3>
                <p>{eventError}</p>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !eventError && events.length === 0 && (
              <div className="state-card">
                <CalendarDays size={30} />
                <h3>New experiences are on the way.</h3>
                <p>Be the first organizer to publish an unforgettable event.</p>
                <Link to="/dashboard" className="button button-primary">
                  Create an event
                </Link>
              </div>
            )}

            {!loading && !eventError && events.length > 0 && (
              <div className="event-grid">
                {events.slice(0, 3).map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    featured={index === 0}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section experience-section">
          <div className="container experience-grid">
            <div className="experience-intro">
              <span className="section-kicker light">
                Effortless from start to entry
              </span>

              <h2>Everything you need for a better event experience.</h2>

              <p>
                From finding the right event to getting through the gate, every
                interaction is designed to feel secure, simple and fast.
              </p>

              <Link to="/events" className="button button-light">
                Start exploring
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="benefit-grid">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <article className="benefit-card" key={benefit.title}>
                    <span className="benefit-icon">
                      <Icon size={22} />
                    </span>

                    <h3>{benefit.title}</h3>
                    <p>{benefit.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section organizer-section">
          <div className="container organizer-card">
            <div className="organizer-content">
              <span className="section-kicker">For event organizers</span>

              <h2>Your event deserves more than a basic ticket link.</h2>

              <p>
                Create beautiful event pages, sell multiple ticket tiers,
                manage bookings and follow revenue in real time from one
                professional dashboard.
              </p>

              <div className="organizer-features">
                <span>
                  <TicketCheck size={18} />
                  Flexible ticket tiers
                </span>
                <span>
                  <CreditCard size={18} />
                  Secure payments
                </span>
                <span>
                  <Users size={18} />
                  Attendee management
                </span>
              </div>

              <Link to="/dashboard" className="button button-primary">
                Start hosting
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="dashboard-preview">
              <div className="dashboard-preview-header">
                <div>
                  <p>Organizer overview</p>
                  <strong>Performance today</strong>
                </div>

                <span>Live</span>
              </div>

              <div className="preview-stat-grid">
                <div>
                  <span>Revenue</span>
                  <strong>KES 284K</strong>
                  <small>+18.4%</small>
                </div>
                <div>
                  <span>Tickets sold</span>
                  <strong>1,248</strong>
                  <small>+12.8%</small>
                </div>
              </div>

              <div className="preview-chart">
                {[42, 57, 46, 69, 61, 84, 76, 96, 88, 110].map(
                  (height, index) => (
                    <span
                      key={index}
                      style={{ height: `${height}px` }}
                    />
                  )
                )}
              </div>

              <div className="preview-footer">
                <span>
                  <span className="preview-dot" />
                  Regular tickets
                </span>

                <strong>72% sold</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="container final-cta-content">
            <div>
              <span className="section-kicker light">Ready when you are</span>
              <h2>Your next unforgettable event starts here.</h2>
            </div>

            <div className="final-cta-actions">
              <Link to="/events" className="button button-light">
                Explore events
              </Link>

              <Link to="/dashboard" className="button button-outline-light">
                Create an event
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Link to="/" className="brand footer-brand">
              <span className="brand-mark">
                <TicketCheck size={21} />
              </span>
              <span className="brand-copy">
                <strong>Event</strong>
                <span>System</span>
              </span>
            </Link>

            <p>
              Discover, book and manage extraordinary experiences across
              Africa.
            </p>
          </div>

          <div className="footer-links">
            <div>
              <strong>Discover</strong>
              <Link to="/events">All events</Link>
              <Link to="/events?category=Music">Music</Link>
              <Link to="/events?category=Business">Business</Link>
            </div>

            <div>
              <strong>Organizers</strong>
              <Link to="/dashboard">Create an event</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/dashboard">Analytics</Link>
            </div>

            <div>
              <strong>Company</strong>
              <Link to="/">About</Link>
              <Link to="/">Support</Link>
              <Link to="/">Privacy</Link>
            </div>
          </div>
        </div>

        <div className="container footer-bottom">
          <p>© 2026 Event System. All rights reserved.</p>

          <span>
            <ShieldCheck size={15} />
            Secure payments and protected bookings
          </span>
        </div>
      </footer>
    </div>
  );
}

export default Home;
