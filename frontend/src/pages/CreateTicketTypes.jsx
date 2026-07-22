import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Plus,
  TicketCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";

const emptyTicket = {
  name: "",
  description: "",
  price: "",
  quantity: 100,
  max_per_order: 10,
};

function CreateTicketTypes() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([{ ...emptyTicket }]);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      navigate(
        `/login?redirect=/dashboard/events/${eventId}/tickets`
      );
      return;
    }

    async function loadEvent() {
      try {
        const response = await api.get(`/events/${eventId}`);
        setEvent(response.data.data);
      } catch {
        setErrorMessage("The event could not be loaded.");
      }
    }

    loadEvent();
  }, [eventId, navigate]);

  const updateTicket = (index, field, value) => {
    setTickets((current) =>
      current.map((ticket, ticketIndex) =>
        ticketIndex === index
          ? { ...ticket, [field]: value }
          : ticket
      )
    );
  };

  const addTicket = () => {
    setTickets((current) => [...current, { ...emptyTicket }]);
  };

  const removeTicket = (index) => {
    setTickets((current) =>
      current.length === 1
        ? current
        : current.filter((_, ticketIndex) => ticketIndex !== index)
    );
  };

  const saveTickets = async () => {
    setErrorMessage("");

    const invalidTicket = tickets.find(
      (ticket) =>
        !ticket.name.trim() ||
        Number(ticket.price) < 0 ||
        Number(ticket.quantity) < 1 ||
        Number(ticket.max_per_order) < 1
    );

    if (invalidTicket) {
      setErrorMessage(
        "Complete all ticket names, prices and quantities correctly."
      );
      return;
    }

    setSaving(true);

    try {
      await Promise.all(
        tickets.map((ticket) =>
          api.post(`/events/${eventId}/ticket-types`, {
            name: ticket.name.trim(),
            description: ticket.description.trim() || null,
            price: Number(ticket.price).toFixed(2),
            quantity: Number(ticket.quantity),
            max_per_order: Number(ticket.max_per_order),
          })
        )
      );

      setSuccess(true);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Ticket tiers could not be created."
      );
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <main className="ticket-setup-page">
        <section className="ticket-setup-success">
          <span>
            <CheckCircle2 size={42} />
          </span>

          <small className="section-kicker">Tickets created</small>
          <h1>Your event is ready to sell.</h1>

          <p>
            All ticket tiers were added successfully. You can now publish and
            promote <strong>{event?.title}</strong>.
          </p>

          <div>
            <Link
              to={`/events/${eventId}`}
              className="button button-secondary"
            >
              View event
            </Link>

            <Link to="/dashboard" className="button button-primary">
              Return to dashboard
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="ticket-setup-page">
      <div className="container ticket-setup-container">
        <header className="ticket-setup-header">
          <div>
            <Link to="/dashboard" className="ticket-setup-back">
              <ArrowLeft size={17} />
              Back to dashboard
            </Link>

            <span className="section-kicker">Ticket configuration</span>
            <h1>Create ticket tiers.</h1>

            <p>
              Set pricing, availability and purchase limits for{" "}
              <strong>{event?.title || "your event"}</strong>.
            </p>
          </div>

          <div className="ticket-setup-progress">
            <span>1</span>
            <div />
            <span className="active">2</span>
            <div />
            <span>3</span>
          </div>
        </header>

        {errorMessage && (
          <div className="form-alert">{errorMessage}</div>
        )}

        <section className="ticket-setup-list">
          {tickets.map((ticket, index) => (
            <article className="ticket-tier-card" key={index}>
              <div className="ticket-tier-header">
                <div>
                  <span className="ticket-tier-icon">
                    <TicketCheck size={20} />
                  </span>

                  <div>
                    <strong>Ticket tier {index + 1}</strong>
                    <p>
                      Regular, VIP, Early Bird or another access level.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Remove ticket tier"
                  onClick={() => removeTicket(index)}
                  disabled={tickets.length === 1}
                >
                  <Trash2 size={17} />
                </button>
              </div>

              <div className="ticket-tier-grid">
                <div className="form-group">
                  <label>Ticket name</label>

                  <input
                    type="text"
                    placeholder="Regular"
                    value={ticket.name}
                    onChange={(event) =>
                      updateTicket(index, "name", event.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Price</label>

                  <div className="input-shell">
                    <CircleDollarSign size={18} />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="2500"
                      value={ticket.price}
                      onChange={(event) =>
                        updateTicket(index, "price", event.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Quantity</label>

                  <input
                    type="number"
                    min="1"
                    value={ticket.quantity}
                    onChange={(event) =>
                      updateTicket(index, "quantity", event.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Maximum per order</label>

                  <input
                    type="number"
                    min="1"
                    value={ticket.max_per_order}
                    onChange={(event) =>
                      updateTicket(
                        index,
                        "max_per_order",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group ticket-tier-description">
                  <label>Description</label>

                  <textarea
                    rows="4"
                    placeholder="General admission access."
                    value={ticket.description}
                    onChange={(event) =>
                      updateTicket(
                        index,
                        "description",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>
            </article>
          ))}
        </section>

        <button
          type="button"
          className="ticket-add-button"
          onClick={addTicket}
        >
          <Plus size={18} />
          Add another ticket tier
        </button>

        <div className="ticket-setup-actions">
          <Link to="/dashboard" className="button button-secondary">
            Save for later
          </Link>

          <button
            type="button"
            className="button button-primary"
            onClick={saveTickets}
            disabled={saving}
          >
            {saving ? "Creating tickets..." : "Create ticket tiers"}
            {!saving && <ArrowRight size={17} />}
          </button>
        </div>
      </div>
    </main>
  );
}

export default CreateTicketTypes;
