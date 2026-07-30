import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Image,
  MapPin,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";

function formatDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function EditEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    async function loadPage() {
      setLoading(true);
      setServerError("");

      try {
        const [eventResponse, categoriesResponse] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get("/categories"),
        ]);

        const event = eventResponse.data.data;

        reset({
          title: event.title || "",
          description: event.description || "",
          venue: event.venue || "",
          city: event.city || "",
          country: event.country || "",
          category_id: event.category_id || "",
          start_date: formatDateTimeLocal(event.start_date),
          end_date: formatDateTimeLocal(event.end_date),
          capacity: event.capacity || 1,
          banner_image: event.banner_image || "",
          latitude: event.latitude ?? "",
          longitude: event.longitude ?? "",
        });

        setCategories(categoriesResponse.data.data || []);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate(
            `/login?redirect=/dashboard/events/${eventId}/edit`
          );
          return;
        }

        setServerError(
          error.response?.data?.message ||
            "The event details could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [eventId, navigate, reset]);

  const onSubmit = async (values) => {
    setServerError("");
    setSuccessMessage("");

    if (new Date(values.end_date) <= new Date(values.start_date)) {
      setServerError("The end date must be after the start date.");
      return;
    }

    try {
      await api.patch(`/events/${eventId}`, {
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

      setSuccessMessage("Event updated successfully.");
    } catch (error) {
      const response = error.response?.data;

      setServerError(
        response?.message ||
          Object.values(response?.errors || {})?.[0]?.[0] ||
          "The event could not be updated."
      );
    }
  };

  if (loading) {
    return (
      <main className="container my-events-page">
        <div className="my-events-loading">
          <span className="loading-spinner" />
          <h1>Loading event...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="create-event-page">
      <div className="container create-event-container">
        <header className="create-event-header">
          <div>
            <Link
              to="/dashboard/events"
              className="create-event-back"
            >
              <ArrowLeft size={17} />
              Back to my events
            </Link>

            <span className="section-kicker">
              Organizer workspace
            </span>

            <h1>Edit event details.</h1>

            <p>
              Update the information attendees see before booking.
            </p>
          </div>
        </header>

        <form
          className="create-event-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          {serverError && (
            <div className="form-alert" role="alert">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="form-success" role="status">
              <CheckCircle2 size={18} />
              {successMessage}
            </div>
          )}

          <section className="create-event-card">
            <div className="create-event-card-heading">
              <span>
                <Image size={21} />
              </span>

              <div>
                <h2>Event details</h2>
                <p>Edit the title, description and category.</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="title">Event title</label>

              <input
                id="title"
                type="text"
                {...register("title", {
                  required: "Event title is required.",
                  minLength: {
                    value: 5,
                    message: "Use at least 5 characters.",
                  },
                })}
              />

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
            </div>
          </section>

          <section className="create-event-card">
            <div className="create-event-card-heading">
              <span>
                <CalendarDays size={21} />
              </span>

              <div>
                <h2>Date and capacity</h2>
                <p>Update the schedule and attendance limit.</p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_date">
                  Start date and time
                </label>

                <input
                  id="start_date"
                  type="datetime-local"
                  {...register("start_date", {
                    required: "Start date is required.",
                  })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="end_date">
                  End date and time
                </label>

                <input
                  id="end_date"
                  type="datetime-local"
                  {...register("end_date", {
                    required: "End date is required.",
                  })}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="capacity">Event capacity</label>

              <input
                id="capacity"
                type="number"
                min="1"
                {...register("capacity", {
                  required: "Capacity is required.",
                  min: {
                    value: 1,
                    message: "Capacity must be at least 1.",
                  },
                })}
              />
            </div>
          </section>

          <section className="create-event-card">
            <div className="create-event-card-heading">
              <span>
                <MapPin size={21} />
              </span>

              <div>
                <h2>Location</h2>
                <p>Edit the venue and geographical details.</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="venue">Venue</label>

              <input
                id="venue"
                type="text"
                {...register("venue", {
                  required: "Venue is required.",
                })}
              />
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

            <div className="form-group">
              <label htmlFor="banner_image">
                Banner image URL
              </label>

              <input
                id="banner_image"
                type="url"
                {...register("banner_image")}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="latitude">Latitude</label>

                <input
                  id="latitude"
                  type="number"
                  step="any"
                  {...register("latitude")}
                />
              </div>

              <div className="form-group">
                <label htmlFor="longitude">Longitude</label>

                <input
                  id="longitude"
                  type="number"
                  step="any"
                  {...register("longitude")}
                />
              </div>
            </div>
          </section>

          <div className="ticket-setup-actions">
            <Link
              to="/dashboard/events"
              className="button button-secondary"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="button button-primary"
              disabled={isSubmitting}
            >
              <Save size={17} />
              {isSubmitting ? "Saving changes..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditEvent;
