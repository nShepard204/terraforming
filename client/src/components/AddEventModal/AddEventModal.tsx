import { useState, type FormEvent } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DatePicker from "react-datepicker";
import CreatableSelect from "react-select/creatable";
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

interface NewVenueDraft {
  name: string;
  address: string;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function toVenueOption(v: EventVenue): SelectOption {
  return {
    value: v.id,
    label: `${v.name ?? "Unnamed venue"}${v.state ? ` (${v.state})` : ""}`,
  };
}

function toHostOption(h: EventHost): SelectOption {
  return { value: h.id, label: h.name ?? "Unnamed host" };
}

async function getAuthToken(): Promise<string | undefined> {
  const session = await authClient.getSession();
  return session.data?.session?.token;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return axios.isAxiosError(error)
    ? (error.response?.data?.error ?? fallback)
    : fallback;
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
  // A new venue/host the user typed in. Nothing is saved until the event is
  // submitted; the server then creates it together with the event.
  const [newVenue, setNewVenue] = useState<NewVenueDraft | null>(null);
  const [newHostName, setNewHostName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const venuesQuery = useQuery({
    queryKey: ["venues"],
    queryFn: async () => {
      const response = await axios.get<EventVenue[]>(`${backendUrl}/venues`);
      return response.data;
    },
  });
  const hostsQuery = useQuery({
    queryKey: ["hosts"],
    queryFn: async () => {
      const response = await axios.get<EventHost[]>(`${backendUrl}/hosts`);
      return response.data;
    },
  });

  const venueOptions = (venuesQuery.data ?? []).map(toVenueOption);
  const hostOptions = (hostsQuery.data ?? []).map(toHostOption);

  // Venue labels carry a " (ST)" suffix, so react-select's default label
  // comparison wouldn't catch someone typing an existing venue's exact name.
  function isNewVenueName(input: string) {
    const name = input.trim().toLowerCase();
    return (
      name.length > 0 &&
      !venuesQuery.data?.some((v) => v.name?.toLowerCase() === name)
    );
  }

  // Pending records show in their select with a placeholder id; only the
  // label is displayed, and the id is never sent to the server.
  const venueValue = newVenue
    ? { value: 0, label: `${newVenue.name} (new)` }
    : venue;
  const hostValue =
    newHostName !== null ? { value: 0, label: `${newHostName} (new)` } : host;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const token = await getAuthToken();
    if (!token) {
      toast.error("You must be logged in to add an event.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        `${backendUrl}/events`,
        {
          eventType,
          date: date ? format(date, "yyyy-MM-dd") : null,
          startTime: startTime ? format(startTime, "HH:mm") : null,
          genesys,
          dragonDuels,
          ...(newVenue
            ? { newVenue: { name: newVenue.name, address: newVenue.address } }
            : { venueId: venue?.value }),
          ...(newHostName !== null
            ? { newHost: { name: newHostName } }
            : { hostId: host?.value }),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (newVenue) queryClient.invalidateQueries({ queryKey: ["venues"] });
      if (newHostName !== null) {
        queryClient.invalidateQueries({ queryKey: ["hosts"] });
      }
      toast.success("Event added");
      onCreated();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to add event."));
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
            <CreatableSelect<SelectOption>
              aria-label="Venue"
              required
              unstyled
              isClearable
              classNamePrefix="add-event-select"
              options={venueOptions}
              value={venueValue}
              onChange={(option) => {
                setVenue(option);
                setNewVenue(null);
              }}
              onCreateOption={(name) => {
                setVenue(null);
                setNewVenue({ name, address: "" });
              }}
              isValidNewOption={isNewVenueName}
              formatCreateLabel={(input) => `Add new venue "${input}"`}
              isLoading={venuesQuery.isLoading}
              isDisabled={venuesQuery.isLoading}
              placeholder={
                venuesQuery.isLoading
                  ? "Loading venues..."
                  : "Search or add a venue..."
              }
              noOptionsMessage={() => "No matching venues"}
              menuPosition="fixed"
            />
          </div>

          {newVenue && (
            <div className="add-event-new-venue">
              <label>
                Venue Name
                <input
                  required
                  value={newVenue.name}
                  onChange={(e) =>
                    setNewVenue({ ...newVenue, name: e.target.value })
                  }
                />
              </label>
              <label>
                Address
                <input
                  required
                  autoFocus
                  value={newVenue.address}
                  placeholder="Street, city, state/province, postal code"
                  onChange={(e) =>
                    setNewVenue({ ...newVenue, address: e.target.value })
                  }
                />
              </label>
            </div>
          )}

          <h3 className="add-event-section">Host</h3>

          <div className="add-event-span">
            <CreatableSelect<SelectOption>
              aria-label="Host"
              required
              unstyled
              isClearable
              classNamePrefix="add-event-select"
              options={hostOptions}
              value={hostValue}
              onChange={(option) => {
                setHost(option);
                setNewHostName(null);
              }}
              onCreateOption={(name) => {
                setHost(null);
                setNewHostName(name.trim());
              }}
              formatCreateLabel={(input) => `Add new host "${input}"`}
              isLoading={hostsQuery.isLoading}
              isDisabled={hostsQuery.isLoading}
              placeholder={
                hostsQuery.isLoading
                  ? "Loading hosts..."
                  : "Search or add a host..."
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
