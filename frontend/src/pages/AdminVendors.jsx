import {
  CheckCircle2,
  ShieldCheck,
  Store,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import api from "../api/axios";

function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadVendors() {
      try {
        const response = await api.get("/admin/vendors");
        setVendors(response.data.data || []);
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ||
            "Vendor profiles could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    }

    loadVendors();
  }, []);

  const updateApproval = async (vendor, isApproved) => {
    setActionId(vendor.id);
    setErrorMessage("");

    try {
      const response = await api.patch(
        `/admin/vendors/${vendor.id}/approval`,
        {
          is_approved: isApproved,
        }
      );

      setVendors((current) =>
        current.map((item) =>
          item.id === vendor.id
            ? response.data.data
            : item
        )
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Vendor approval could not be updated."
      );
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <main className="container my-events-page">
        <div className="my-events-loading">
          <span className="loading-spinner" />
          <h1>Loading vendors...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-vendors-page">
      <div className="container">
        <header className="admin-vendors-header">
          <div>
            <span className="section-kicker">
              Administrator workspace
            </span>

            <h1>Vendor approvals</h1>

            <p>
              Review vendor profiles and control who can participate in
              platform events.
            </p>
          </div>

          <div className="admin-vendor-summary">
            <ShieldCheck size={22} />

            <div>
              <span>Total vendors</span>
              <strong>{vendors.length}</strong>
            </div>
          </div>
        </header>

        {errorMessage && (
          <div className="form-alert" role="alert">
            {errorMessage}
          </div>
        )}

        {vendors.length === 0 ? (
          <section className="my-events-empty">
            <span>
              <Store size={32} />
            </span>

            <h2>No vendor profiles yet.</h2>

            <p>
              Vendor applications will appear here after vendors create
              their business profiles.
            </p>
          </section>
        ) : (
          <div className="admin-vendor-grid">
            {vendors.map((vendor) => {
              const isProcessing = actionId === vendor.id;

              return (
                <article className="admin-vendor-card" key={vendor.id}>
                  <div className="admin-vendor-logo">
                    {vendor.logo_url ? (
                      <img
                        src={vendor.logo_url}
                        alt={vendor.business_name}
                      />
                    ) : (
                      <Store size={36} />
                    )}
                  </div>

                  <div className="admin-vendor-content">
                    <div className="admin-vendor-title">
                      <div>
                        <h2>{vendor.business_name}</h2>
                        <span>{vendor.business_type}</span>
                      </div>

                      <span
                        className={
                          vendor.is_approved
                            ? "vendor-status-approved"
                            : "vendor-status-pending"
                        }
                      >
                        {vendor.is_approved
                          ? "Approved"
                          : "Pending"}
                      </span>
                    </div>

                    <p>
                      {vendor.description ||
                        "No business description provided."}
                    </p>

                    <div className="admin-vendor-details">
                      <span>{vendor.phone}</span>
                      <span>
                        {vendor.city}, {vendor.country}
                      </span>
                    </div>

                    <div className="admin-vendor-actions">
                      {!vendor.is_approved ? (
                        <button
                          type="button"
                          className="button button-primary"
                          disabled={isProcessing}
                          onClick={() =>
                            updateApproval(vendor, true)
                          }
                        >
                          <CheckCircle2 size={17} />
                          {isProcessing
                            ? "Approving..."
                            : "Approve vendor"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="button button-danger"
                          disabled={isProcessing}
                          onClick={() =>
                            updateApproval(vendor, false)
                          }
                        >
                          <XCircle size={17} />
                          {isProcessing
                            ? "Revoking..."
                            : "Revoke approval"}
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
  );
}

export default AdminVendors;
