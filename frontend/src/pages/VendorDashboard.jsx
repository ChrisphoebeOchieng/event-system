import {
  Building2,
  CheckCircle2,
  Clock3,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import api from "../api/axios";

function VendorDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      business_name: "",
      business_type: "food",
      description: "",
      phone: "",
      city: "Nairobi",
      country: "Kenya",
      logo_url: "",
    },
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get("/vendors/profile");
        const vendor = response.data.data;

        setProfile(vendor);

        reset({
          business_name: vendor.business_name || "",
          business_type: vendor.business_type || "food",
          description: vendor.description || "",
          phone: vendor.phone || "",
          city: vendor.city || "",
          country: vendor.country || "Kenya",
          logo_url: vendor.logo_url || "",
        });
      } catch (error) {
        if (error.response?.status !== 404) {
          setServerError(
            error.response?.data?.message ||
              "The vendor profile could not be loaded."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [reset]);

  const onSubmit = async (values) => {
    setServerError("");
    setSuccessMessage("");

    const payload = {
      business_name: values.business_name.trim(),
      business_type: values.business_type,
      description: values.description.trim() || null,
      phone: values.phone.trim(),
      city: values.city.trim(),
      country: values.country.trim(),
      logo_url: values.logo_url.trim() || null,
    };

    try {
      const response = profile
        ? await api.patch("/vendors/profile", payload)
        : await api.post("/vendors/profile", payload);

      setProfile(response.data.data);
      setSuccessMessage(
        profile
          ? "Vendor profile updated successfully."
          : "Vendor profile created successfully."
      );
    } catch (error) {
      const response = error.response?.data;

      setServerError(
        response?.message ||
          Object.values(response?.errors || {})?.[0]?.[0] ||
          "The vendor profile could not be saved."
      );
    }
  };

  if (loading) {
    return (
      <main className="container vendor-page">
        <div className="my-events-loading">
          <span className="loading-spinner" />
          <h1>Loading vendor workspace...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="vendor-page">
      <div className="container vendor-container">
        <header className="vendor-header">
          <div>
            <span className="section-kicker">Vendor workspace</span>
            <h1>Manage your business profile.</h1>
            <p>
              Create a professional profile for food, drink, catering and
              merchandise services.
            </p>
          </div>

          {profile && (
            <div
              className={`vendor-approval-card ${
                profile.is_approved ? "approved" : "pending"
              }`}
            >
              {profile.is_approved ? (
                <CheckCircle2 size={22} />
              ) : (
                <Clock3 size={22} />
              )}

              <div>
                <span>Approval status</span>
                <strong>
                  {profile.is_approved
                    ? "Approved vendor"
                    : "Pending approval"}
                </strong>
              </div>
            </div>
          )}
        </header>

        <div className="vendor-grid">
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
                  <Building2 size={21} />
                </span>

                <div>
                  <h2>Business information</h2>
                  <p>Tell organizers what your business offers.</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="business_name">Business name</label>

                <input
                  id="business_name"
                  type="text"
                  placeholder="Phoebe Treats"
                  {...register("business_name", {
                    required: "Business name is required.",
                    minLength: {
                      value: 2,
                      message: "Use at least 2 characters.",
                    },
                  })}
                />

                {errors.business_name && (
                  <span className="field-error">
                    {errors.business_name.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="business_type">Business type</label>

                <select
                  id="business_type"
                  {...register("business_type", {
                    required: "Business type is required.",
                  })}
                >
                  <option value="food">Food</option>
                  <option value="drinks">Drinks</option>
                  <option value="catering">Catering</option>
                  <option value="desserts">Desserts</option>
                  <option value="merchandise">Merchandise</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Business description</label>

                <textarea
                  id="description"
                  rows="6"
                  placeholder="Describe your products, services and what makes your business special."
                  {...register("description")}
                />
              </div>
            </section>

            <section className="create-event-card">
              <div className="create-event-card-heading">
                <span>
                  <Store size={21} />
                </span>

                <div>
                  <h2>Contact and location</h2>
                  <p>Help organizers contact and locate your business.</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone number</label>

                <input
                  id="phone"
                  type="tel"
                  placeholder="+254 700 000 000"
                  {...register("phone", {
                    required: "Phone number is required.",
                    minLength: {
                      value: 7,
                      message: "Enter a valid phone number.",
                    },
                  })}
                />

                {errors.phone && (
                  <span className="field-error">
                    {errors.phone.message}
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

              <div className="form-group">
                <label htmlFor="logo_url">Logo image URL</label>

                <input
                  id="logo_url"
                  type="url"
                  placeholder="https://example.com/logo.jpg"
                  {...register("logo_url")}
                />
              </div>
            </section>

            <button
              type="submit"
              className="button button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving profile..."
                : profile
                  ? "Update vendor profile"
                  : "Create vendor profile"}
            </button>
          </form>

          <aside className="vendor-preview">
            <span className="section-kicker">Profile preview</span>

            <div className="vendor-preview-card">
              {profile?.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt={profile.business_name}
                />
              ) : (
                <div className="vendor-logo-placeholder">
                  <Store size={36} />
                </div>
              )}

              <h2>{profile?.business_name || "Your business name"}</h2>

              <span className="vendor-type">
                {profile?.business_type || "Business type"}
              </span>

              <p>
                {profile?.description ||
                  "Your business description will appear here."}
              </p>

              <small>
                {profile
                  ? `${profile.city}, ${profile.country}`
                  : "Your location"}
              </small>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default VendorDashboard;
