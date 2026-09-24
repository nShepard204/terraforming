import { useState, type FormEvent } from "react";
import axios from "axios";
import { toast } from "sonner";
import { authClient } from "../../lib/auth-client";
import "./AddEventModal.css";

const eventTypes = [
  "Local",
  "Regional",
  "Case Tournament",
  "OTS Championship",
  "Sneak Peek",
  "Yu-Gi-Oh Day",
] as const;

interface AddEventModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function AddEventModal({ onClose, onCreated }: AddEventModalProps) {
  const [eventType, setEventType] = useState<string>(eventTypes[0]);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [genesys, setGenesys] = useState(false);
  const [dragonDuels, setDragonDuels] = useState(false);
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [venueState, setVenueState] = useState("");
  const [venueCountry, setVenueCountry] = useState("");
  const [hostName, setHostName] = useState("");
  const [hostEmail, setHostEmail] = useState("");
  const [hostPhone, setHostPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const session = await authClient.getSession();
    const token = session.data?.session?.token;
    if (!token) {
      toast.error("You must be logged in to add an event.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/events`,
        {
          eventType,
          date: date || null,
          startTime: startTime || null,
          genesys,
          dragonDuels,
          venue: {
            name: venueName,
            address: venueAddress,
            state: venueState || null,
            country: venueCountry || null,
          },
          host: {
            name: hostName,
            email: hostEmail || null,
            phoneNumber: hostPhone || null,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Event added");
      onCreated();
      onClose();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? "Failed to add event.")
        : "Failed to add event.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="add-event-overlay" onClick={onClose}>
      <form
        className="add-event-card"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="add-event-header">
          <h2>Add Event</h2>
          <button
            type="button"
            className="add-event-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="add-event-grid">
          <label>
            Event Type
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <label>
            Start Time
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </label>

          <div className="add-event-checkboxes">
            <label className="add-event-checkbox">
              <input
                type="checkbox"
                checked={genesys}
                onChange={(e) => setGenesys(e.target.checked)}
              />
              Genesys
            </label>
            <label className="add-event-checkbox">
              <input
                type="checkbox"
                checked={dragonDuels}
                onChange={(e) => setDragonDuels(e.target.checked)}
              />
              Dragon Duels
            </label>
          </div>

          <h3 className="add-event-section">Venue</h3>

          <label className="add-event-span">
            Name
            <input
              required
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
            />
          </label>

          <label className="add-event-span">
            Address
            <input
              required
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="123 Main St, City, State"
            />
          </label>

          <label>
            State
            <input
              value={venueState}
              maxLength={2}
              onChange={(e) => setVenueState(e.target.value.toUpperCase())}
              placeholder="OH"
            />
          </label>

          <label>
            Country
            <input
              value={venueCountry}
              onChange={(e) => setVenueCountry(e.target.value)}
              placeholder="USA"
            />
          </label>

          <h3 className="add-event-section">Host</h3>

          <label className="add-event-span">
            Name
            <input
              required
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={hostEmail}
              onChange={(e) => setHostEmail(e.target.value)}
            />
          </label>

          <label>
            Phone
            <input
              value={hostPhone}
              onChange={(e) => setHostPhone(e.target.value)}
            />
          </label>
        </div>

        <button
          type="submit"
          className="add-event-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Event"}
        </button>
      </form>
    </div>
  );
}
