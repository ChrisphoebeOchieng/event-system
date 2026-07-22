import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Image,
  MapPin,
  Sparkles,
  TicketCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";

function CreateEvent() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [serverError, setServerError] = useState("");
  const [createdEvent, setCreatedEvent] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      venue: "",
      city: "Nairobi",
      country: "Kenya",
      category_id: "",
      start_date: "",
      end_date: "",
      capacity: 100,
      banner_image: "",
      latitude: "",
      longitude: "",
    },
  });

  const title = watch("title");
  const venue = watch("venue");
  const city = watch("city");
  const bannerImage = watch("banner_image");

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      navigate("/login?redirect=/dashboard/events/create");
      return;
    }

    async function loadCategories() {
      try {
        const response = await api.get("/categories");
        setCategories(response.data.data || []);
      } catch {
        setServerError(
          "Event categories could not be loaded. Please refresh the page."
        );
      }
    }

    loadCategories();
  }, [navigate]);

  const onSubmit = async (values) => {
    setServerError("");

    try {
      const response = await api.post("/events/", {
        title: values.title.trim(),
        description: values.description.trim(),
        venue: values.venue.trim(),
        city: values.city.trim(),
        country: values.country.trim(),
        category_id: values.category_id,
        start_date: values.start_date,
        end_date: values.end_date,
        capacity: Number(values.capacity),
        banner_image: values.banner_image.trim() || null,
        latitude: values.latitude ? Number(values.latitude) : null,
        longitude: values.longitude ? Number(values.longitude) : null,
      });

      setCreatedEvent(response.data.data);
    } catch (error) {
      const response = error.response?.data;

      setServerError(
        response?.message ||
          Object.values(response?.errors || {})?.[0]?.[0] ||
          "The event could not be created. Please review the details."
      );
    }
  };

  if (createdEvent) {
    return (
      <main className="create-event-page">
        <section className="create-event-success">
          <span className="create-event-success-icon">
            <CheckCircle2 size={42} />
          </span>

          <span className="section-kicker">Event created</span>

          <h1>Your event is ready.</h1>

          <p>
            <strong>{createdEvent.title}</strong> was created successfully.
            Add ticket tiers next so attendees can start booking.
          </p>

          <div className="create-event-success-actions">
            <Link
              to={`/events/${createdEvent.id}`}
              className="button button-secondary"
            >
              View event
            </Link>

            <Link
              to={`/dashboard/events/${createdEvent.id}/tickets`}
              className="button button-primary"
            >
              Add ticket tiers
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="create-event-page">
      <div className="container create-event-container">
        <header className="create-event-header">
          <div>
            <Link to="/dashboard" className="create-event-back">
              <ArrowLeft size={17} />
              Back to dashboard
            </Link>

            <span className="section-kicker">Organizer workspace</span>

            <h1>Create an unforgettable event.</h1>

            <p>
              Add the essential information attendees need before booking.
            </p>
          </div>

          <div className="create-event-progress">
            <span className="create-event-progress-active">1</span>
            <div />
            <span>2</span>
            <div />
            <span>3</span>
          </div>
        </header>

        <div className="create-event-grid">
          <form
            className="create-event-form"
            onSubmit={handleSubmit(onSubmit)}
          >
            {serverError && (
              <div className="form-alert" role="alert">
                {serverError}
              </div>
            )}

            <section className="create-event-card">
              <div className="create-event-card-heading">
                <span>
                  <Sparkles size={21} />
                </span>

                <div>
                  <h2>Event details</h2>
                  <p>Give attendees a clear reason to attend.</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="title">Event title</label>

                <div
                  className={`input-shell ${
                    errors.title ? "input-error" : ""
                  }`}
                >
                  <input
                    id="title"
                    type="text"
                    placeholder="Nairobi Summer Fest 2026"
                    {...register("title", {
                      required: "Event title is required.",
                      minLength: {
                        value: 5,
                        message: "Use at least 5 characters.",
                      },
                    })}
                  />
                </div>

                {errors.title && (
                  <span className="field-error">
                    {errors.title.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>

                <textarea
                  id="description"
                  className={errors.description ? "textarea-error" : ""}
                  placeholder="Describe the experience, performers, programme and what makes this event special."
                  rows="7"
                  {...register("description", {
                    required: "Event description is required.",
                    minLength: {
                      value: 30,
                      message: "Add at least 30 characters.",
                    },
                  })}
                />

                {errors.description && (
                  <span className="field-error">
                    {errors.description.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="category_id">Category</label>

                <select
                  id="category_id"
                  className={errors.category_id ? "select-error" : ""}
                  {...register("category_id", {
                    required: "Select an event category.",
                  })}
                >
                  <option value="">Choose a category</option>

                  {categories.map((category) => (
                    <option value={category.id} key={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {errors.category_id && (
                  <span className="field-error">
                    {errors.category_id.message}
                  </span>
                )}
              </div>
            </section>

            <section className="create-event-card">
              <div className="create-event-card-heading">
                <span>
                  <CalendarDays size={21} />
                </span>

                <div>
                  <h2>Date and time</h2>
                  <p>Set when your event begins and ends.</p>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start_date">Start date and time</label>

                  <input
                    id="start_date"
                    type="datetime-local"
                    className={errors.start_date ? "input-error-control" : ""}
                    {...register("start_date", {
                      required: "Start date is required.",
                    })}
                  />

                  {errors.start_date && (
                    <span className="field-error">
                      {errors.start_date.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="end_date">End date and time</label>

                  <input
                    id="end_date"
                    type="datetime-local"
                    className={errors.end_date ? "input-error-control" : ""}
                    {...register("end_date", {
                      required: "End date is required.",
                    })}
                  />

                  {errors.end_date && (
                    <span className="field-error">
                      {errors.end_date.message}
                    </span>
                  )}
                </div>
              </div>
            </section>

            <section className="create-event-card">
              <div className="create-event-card-heading">
                <span>
                  <MapPin size={21} />
                </span>

                <div>
                  <h2>Venue and location</h2>
                  <p>Help attendees know exactly where to go.</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="venue">Venue</label>

                <div
                  className={`input-shell ${
                    errors.venue ? "input-error" : ""
                  }`}
                >
                  <MapPin size={18} />

                  <input
                    id="venue"
                    type="text"
                    placeholder="Uhuru Gardens"
                    {...register("venue", {
                      required: "Venue is required.",
                    })}
                  />
                </div>

                {errors.venue && (
                  <span className="field-error">
                    {errors.venue.message}
                  </span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>

                  <input
                    id="city"
                    type="text"
                    {...register("city", {
                      required: "City is required.",
                    })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="country">Country</label>

                  <input
                    id="country"
                    type="text"
                    {...register("country", {
                      required: "Country is required.",
                    })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="latitude">Latitude</label>

                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="-1.3225"
                    {...register("latitude")}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="longitude">Longitude</label>

                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="36.8011"
                    {...register("longitude")}
                  />
                </div>
              </div>
            </section>

            <section className="create-event-card">
              <div className="create-event-card-heading">
                <span>
                  <Users size={21} />
                </span>

                <div>
                  <h2>Capacity and media</h2>
                  <p>Set attendance limits and event imagery.</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="capacity">Maximum capacity</label>

                <input
                  id="capacity"
                  type="number"
                  min="1"
                  {...register("capacity", {
                    required: "Capacity is required.",
                    min: {
                      value: 1,
                      message: "Capacity must be at least one.",
                    },
                  })}
                />

                {errors.capacity && (
                  <span className="field-error">
                    {errors.capacity.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="banner_image">Banner image URL</label>

                <div className="input-shell">
                  <Image size={18} />

                  <input
                    id="banner_image"
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    {...register("banner_image")}
                  />
                </div>
              </div>
            </section>

            <div className="create-event-submit-row">
              <Link to="/dashboard" className="button button-secondary">
                Save for later
              </Link>

              <button
                type="submit"
                className="button button-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating event..." : "Create event"}
                {!isSubmitting && <ArrowRight size={17} />}
              </button>
            </div>
          </form>

          <aside className="create-event-preview">
            <span className="section-kicker">Live preview</span>

            <article className="create-event-preview-card">
              <div className="create-event-preview-image">
                {bannerImage ? (
                  <img src={bannerImage} alt="" />
                ) : (
                  <div>
                    <Image size={31} />
                    <span>Add a banner image</span>
                  </div>
                )}

                <span>Upcoming</span>
              </div>

              <div className="create-event-preview-content">
                <div className="create-event-preview-meta">
                  <CalendarDays size={15} />
                  Date to be confirmed
                </div>

                <h2>{title || "Your event title"}</h2>

                <p>
                  <MapPin size={15} />
                  {venue || "Venue"}, {city || "City"}
                </p>
              </div>
            </article>

            <div className="create-event-preview-note">
              <TicketCheck size={20} />

              <div>
                <strong>Next: ticket setup</strong>
                <p>
                  After creating the event, add Regular, VIP or Early Bird
                  ticket tiers.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default CreateEvent;
