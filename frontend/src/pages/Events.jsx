import {
  CalendarDays,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import api from "../api/axios";
import EventCard from "../components/EventCard";
import Navbar from "../components/Navbar";

function Events() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");
  const [selectedCity, setSelectedCity] =
    useState("All locations");
  const [selectedDate, setSelectedDate] = useState("any");
  const [selectedPrice, setSelectedPrice] = useState("any");
  const [sortBy, setSortBy] = useState("soonest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadEvents = async () => {
    setLoading(true);
    setErrorMessage("");

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
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const categories = useMemo(() => {
    const values = events
      .map((event) => event.category_name)
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [events]);

  const cities = useMemo(() => {
    const values = events
      .map((event) => event.city)
      .filter(Boolean);

    return ["All locations", ...new Set(values)];
  }, [events]);

  const matchesDateFilter = (event) => {
    if (selectedDate === "any") {
      return true;
    }

    const now = new Date();
    const eventDate = new Date(event.start_date);
    const end = new Date(now);

    if (selectedDate === "today") {
      return (
        eventDate.getFullYear() === now.getFullYear() &&
        eventDate.getMonth() === now.getMonth() &&
        eventDate.getDate() === now.getDate()
      );
    }

    if (selectedDate === "weekend") {
      const day = now.getDay();
      const daysUntilSaturday = (6 - day + 7) % 7;

      const saturday = new Date(now);
      saturday.setHours(0, 0, 0, 0);
      saturday.setDate(now.getDate() + daysUntilSaturday);

      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      sunday.setHours(23, 59, 59, 999);

      return eventDate >= saturday && eventDate <= sunday;
    }

    if (selectedDate === "week") {
      end.setDate(now.getDate() + 7);
      return eventDate >= now && eventDate <= end;
    }

    if (selectedDate === "month") {
      end.setDate(now.getDate() + 30);
      return eventDate >= now && eventDate <= end;
    }

    return true;
  };

  const matchesPriceFilter = (event) => {
    if (selectedPrice === "any") {
      return true;
    }

    const price = Number(event.minimum_price || 0);

    if (selectedPrice === "free") {
      return price === 0;
    }

    if (selectedPrice === "under-1000") {
      return price > 0 && price < 1000;
    }

    if (selectedPrice === "1000-3000") {
      return price >= 1000 && price <= 3000;
    }

    if (selectedPrice === "above-3000") {
      return price > 3000;
    }

    return true;
  };

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    const results = events.filter((event) => {
      const matchesSearch =
        !normalizedSearch ||
        event.title
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        event.description
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        event.venue
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        event.city
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        event.category_name
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "All" ||
        event.category_name === selectedCategory;

      const matchesCity =
        selectedCity === "All locations" ||
        event.city === selectedCity;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCity &&
        matchesDateFilter(event) &&
        matchesPriceFilter(event)
      );
    });

    return [...results].sort((first, second) => {
      if (sortBy === "latest") {
        return (
          new Date(second.created_at) -
          new Date(first.created_at)
        );
      }

      if (sortBy === "price-low") {
        return (
          Number(first.minimum_price || 0) -
          Number(second.minimum_price || 0)
        );
      }

      if (sortBy === "price-high") {
        return (
          Number(second.minimum_price || 0) -
          Number(first.minimum_price || 0)
        );
      }

      if (sortBy === "popular") {
        return (
          Number(second.tickets_sold || 0) -
          Number(first.tickets_sold || 0)
        );
      }

      if (sortBy === "featured") {
        return Number(second.featured) - Number(first.featured);
      }

      return (
        new Date(first.start_date) -
        new Date(second.start_date)
      );
    });
  }, [
    events,
    searchTerm,
    selectedCategory,
    selectedCity,
    selectedDate,
    selectedPrice,
    sortBy,
  ]);

  const activeFilterCount = [
    selectedCategory !== "All",
    selectedCity !== "All locations",
    selectedDate !== "any",
    selectedPrice !== "any",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedCity("All locations");
    setSelectedDate("any");
    setSelectedPrice("any");
    setSortBy("soonest");
  };

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
              Explore concerts, festivals, conferences,
              nightlife and unforgettable experiences near you.
            </p>

            <div className="events-search-panel">
              <div className="events-search-field">
                <Search size={20} />

                <input
                  type="search"
                  placeholder="Search events, venues, cities or categories"
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
                    <option key={city} value={city}>
                      {city}
                    </option>
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
                    onClick={() =>
                      setSelectedCategory(category)
                    }
                  >
                    {category}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="events-filter-button"
                onClick={() =>
                  setFiltersOpen((current) => !current)
                }
              >
                <SlidersHorizontal size={17} />
                Filters

                {activeFilterCount > 0 && (
                  <span className="events-filter-count">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {filtersOpen && (
              <section className="events-advanced-filters">
                <div className="events-filter-heading">
                  <div>
                    <span className="section-kicker">
                      Refine results
                    </span>

                    <h3>Advanced filters</h3>
                  </div>

                  <button
                    type="button"
                    aria-label="Close filters"
                    onClick={() => setFiltersOpen(false)}
                  >
                    <X size={19} />
                  </button>
                </div>

                <div className="events-filter-grid">
                  <label>
                    <span>Location</span>

                    <select
                      value={selectedCity}
                      onChange={(event) =>
                        setSelectedCity(event.target.value)
                      }
                    >
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Date</span>

                    <select
                      value={selectedDate}
                      onChange={(event) =>
                        setSelectedDate(event.target.value)
                      }
                    >
                      <option value="any">Any date</option>
                      <option value="today">Today</option>
                      <option value="weekend">
                        This weekend
                      </option>
                      <option value="week">
                        Next 7 days
                      </option>
                      <option value="month">
                        Next 30 days
                      </option>
                    </select>
                  </label>

                  <label>
                    <span>Price</span>

                    <select
                      value={selectedPrice}
                      onChange={(event) =>
                        setSelectedPrice(event.target.value)
                      }
                    >
                      <option value="any">Any price</option>
                      <option value="free">Free</option>
                      <option value="under-1000">
                        Below KES 1,000
                      </option>
                      <option value="1000-3000">
                        KES 1,000–3,000
                      </option>
                      <option value="above-3000">
                        Above KES 3,000
                      </option>
                    </select>
                  </label>

                  <label>
                    <span>Sort results</span>

                    <select
                      value={sortBy}
                      onChange={(event) =>
                        setSortBy(event.target.value)
                      }
                    >
                      <option value="soonest">
                        Date: Soonest
                      </option>
                      <option value="latest">
                        Recently added
                      </option>
                      <option value="featured">
                        Featured first
                      </option>
                      <option value="popular">
                        Most popular
                      </option>
                      <option value="price-low">
                        Price: Low to high
                      </option>
                      <option value="price-high">
                        Price: High to low
                      </option>
                    </select>
                  </label>
                </div>

                <div className="events-filter-actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={clearFilters}
                  >
                    <RotateCcw size={16} />
                    Clear filters
                  </button>

                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => setFiltersOpen(false)}
                  >
                    Show {filteredEvents.length} events
                  </button>
                </div>
              </section>
            )}

            <div className="events-results-header">
              <div>
                <span className="section-kicker">
                  Explore events
                </span>

                <h2>
                  {filteredEvents.length}
                  {filteredEvents.length === 1
                    ? " experience"
                    : " experiences"}
                </h2>
              </div>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
              >
                <option value="soonest">
                  Date: Soonest
                </option>
                <option value="latest">
                  Recently added
                </option>
                <option value="featured">
                  Featured first
                </option>
                <option value="popular">
                  Most popular
                </option>
                <option value="price-low">
                  Price: Low to high
                </option>
                <option value="price-high">
                  Price: High to low
                </option>
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
                  onClick={loadEvents}
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
                    Try changing the search term or filters.
                  </p>

                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={clearFilters}
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
                    <EventCard
                      key={event.id}
                      event={event}
                    />
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
