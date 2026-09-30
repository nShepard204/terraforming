import { useState, type FormEvent } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { format } from "date-fns";
import { authClient } from "../../lib/auth-client";
import type { EventHost, EventVenue } from "../../lib/models.ts";
import "react-datepicker/dist/react-datepicker.css";
import "./AddEventModal.css";

const eventTypes = [
  "Local",
  "Regional",
  "Case Tournament",
  "OTS Championship",
  "Sneak Peek",
  "Yu-Gi-Oh Day",
] as const;

interface SelectOption {
  value: number;
  label: string;
}

interface AddEventModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function AddEventModal({ onClose, onCreated }: AddEventModalProps) {
  const [eventType, setEventType] = useState<string>(eventTypes[0]);
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [genesys, setGenesys] = useState(false);
  const [dragonDuels, setDragonDuels] = useState(false);
  const [venue, setVenue] = useState<SelectOption | null>(null);
  const [host, setHost] = useState<SelectOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const venuesQuery = useQuery({
    queryKey: ["venues"],
    queryFn: async () => {
      const response = await axios.get<EventVenue[]>(
        `${import.meta.env.VITE_BACKEND_URL}/venues`,
      );
      return response.data;
    },
  });
  const hostsQuery = useQuery({
    queryKey: ["hosts"],
    queryFn: async () => {
      const response = await axios.get<EventHost[]>(
        `${import.meta.env.VITE_BACKEND_URL}/hosts`,
      );
      return response.data;
    },
  });

  const venueOptions: SelectOption[] = (venuesQuery.data ?? []).map((v) => ({
    value: v.id,
    label: `${v.name ?? "Unnamed venue"}${v.state ? ` (${v.state})` : ""}`,
  }));
  const hostOptions: SelectOption[] = (hostsQuery.data ?? []).map((h) => ({
    value: h.id,
    label: h.name ?? "Unnamed host",
  }));

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
          date: date ? format(date, "yyyy-MM-dd") : null,
          startTime: startTime ? format(startTime, "HH:mm") : null,
          genesys,
          dragonDuels,
          venueId: venue?.value,
          hostId: host?.value,
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
            <DatePicker
              selected={date}
              onChange={(value: Date | null) => setDate(value)}
              dateFormat="MM/dd/yyyy"
              placeholderText="mm/dd/yyyy"
              autoComplete="off"
              wrapperClassName="add-event-datepicker-wrapper"
              portalId="add-event-datepicker-portal"
            />
          </label>

          <label>
            Start Time
            <DatePicker
              selected={startTime}
              onChange={(value: Date | null) => setStartTime(value)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={5}
              timeCaption="Time"
              dateFormat="h:mm aa"
              placeholderText="--:-- --"
              autoComplete="off"
              wrapperClassName="add-event-datepicker-wrapper"
              portalId="add-event-datepicker-portal"
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

          <div className="add-event-span">
            <Select<SelectOption>
              aria-label="Venue"
              required
              unstyled
              isClearable
              classNamePrefix="add-event-select"
              options={venueOptions}
              value={venue}
              onChange={setVenue}
              isLoading={venuesQuery.isLoading}
              isDisabled={venuesQuery.isLoading}
              placeholder={
                venuesQuery.isLoading ? "Loading venues..." : "Search venues..."
              }
              noOptionsMessage={() => "No matching venues"}
              menuPosition="fixed"
            />
          </div>

          <h3 className="add-event-section">Host</h3>

          <div className="add-event-span">
            <Select<SelectOption>
              aria-label="Host"
              required
              unstyled
              isClearable
              classNamePrefix="add-event-select"
              options={hostOptions}
              value={host}
              onChange={setHost}
              isLoading={hostsQuery.isLoading}
              isDisabled={hostsQuery.isLoading}
              placeholder={
                hostsQuery.isLoading ? "Loading hosts..." : "Search hosts..."
              }
              noOptionsMessage={() => "No matching hosts"}
              menuPosition="fixed"
            />
          </div>
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
