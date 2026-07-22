import {
  CalendarDays,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import api from "../api/axios";
import EventCard from "../components/EventCard";
import Navbar from "../components/Navbar";

const categories = [
  "All",
  "Music",
  "Technology",
  "Business",
  "Sports",
  "Fashion",
  "Food & Drink",
  "Arts & Culture",
];

function Events() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All locations");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await api.get("/events/");
        setEvents(response.data.data || []);
      } catch {
        setErrorMessage(
          "We couldn't load events right now. Please try again shortly."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const cities = useMemo(() => {
    const availableCities = events
      .map((event) => event.city)
      .filter(Boolean);

    return ["All locations", ...new Set(availableCities)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    return events.filter((event) => {
      const matchesSearch =
        !normalizedSearch ||
        event.title?.toLowerCase().includes(normalizedSearch) ||
        event.venue?.toLowerCase().includes(normalizedSearch) ||
        event.city?.toLowerCase().includes(normalizedSearch);

      const matchesCity =
        selectedCity === "All locations" ||
        event.city === selectedCity;

      /*
       * The current events endpoint does not return the category name yet.
       * Category filtering will become active once that value is included.
       */
      const matchesCategory =
        selectedCategory === "All" ||
        event.category?.name === selectedCategory ||
        event.category_name === selectedCategory;

      return matchesSearch && matchesCity && matchesCategory;
    });
  }, [events, searchTerm, selectedCategory, selectedCity]);

  return (
    <div className="app-shell">
      <Navbar />

      <main className="events-page">
        <section className="events-hero">
          <div className="events-hero-glow" />

          <div className="container events-hero-content">
            <span className="events-hero-kicker">
              <Sparkles size={15} />
              Curated experiences across Africa
            </span>

            <h1>
              Discover events that feel
              <span> made for you.</span>
            </h1>

            <p>
              Explore concerts, festivals, conferences, nightlife and
              unforgettable experiences happening near you.
            </p>

            <div className="events-search-panel">
              <div className="events-search-field">
                <Search size={20} />

                <input
                  type="search"
                  placeholder="Search events, venues or cities"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                />
              </div>

              <div className="events-filter-divider" />

              <div className="events-location-field">
                <MapPin size={19} />

                <select
                  value={selectedCity}
                  onChange={(event) =>
                    setSelectedCity(event.target.value)
                  }
                >
                  {cities.map((city) => (
                    <option key={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="events-content-section">
          <div className="container">
            <div className="events-category-bar">
              <div className="events-category-list">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={
                      selectedCategory === category
                        ? "events-category-active"
                        : ""
                    }
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="events-filter-button"
              >
                <SlidersHorizontal size={17} />
                Filters
              </button>
            </div>

            <div className="events-results-header">
              <div>
                <span className="section-kicker">Explore events</span>

                <h2>
                  {filteredEvents.length}
                  {filteredEvents.length === 1
                    ? " experience"
                    : " experiences"}
                </h2>
              </div>

              <select defaultValue="soonest">
                <option value="soonest">Date: Soonest</option>
                <option value="latest">Recently added</option>
                <option value="featured">Featured first</option>
              </select>
            </div>

            {loading && (
              <div className="event-grid">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    className="event-card event-skeleton"
                    key={item}
                  >
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

            {!loading && errorMessage && (
              <div className="events-state-card">
                <CalendarDays size={32} />
                <h3>Events are temporarily unavailable.</h3>
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

            {!loading &&
              !errorMessage &&
              filteredEvents.length === 0 && (
                <div className="events-state-card">
                  <Search size={32} />
                  <h3>No matching events found.</h3>

                  <p>
                    Try changing your search term, category or
                    location.
                  </p>

                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("All");
                      setSelectedCity("All locations");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}

            {!loading &&
              !errorMessage &&
              filteredEvents.length > 0 && (
                <div className="event-grid events-results-grid">
                  {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Events;
