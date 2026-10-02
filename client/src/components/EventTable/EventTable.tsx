import type { EventInfo } from "../../lib/models.ts";
import "./EventTable.css";

interface EventTableProps {
  events: EventInfo[] | null;
}

export function EventTable({ events }: EventTableProps) {
  return (
    <>
      {events !== null && (
        <section className="results">
          {events.length === 0 ? (
            <p className="empty-state">
              No events found. Try a wider search distance.
            </p>
          ) : (
            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>Event Type</th>
                    <th>Venue</th>
                    <th>Address</th>
                    <th>Host</th>
                    <th>Genesys</th>
                    <th>Dragon Duels</th>
                  </tr>
                </thead>
                <tbody>
                  {events
                    .sort(
                      (a, b) =>
                        new Date(a.date!).getTime() -
                        new Date(b.date!).getTime(),
                    )
                    .map((event) => (
                      <tr key={event.id}>
                        <td>{event.date ?? "-"}</td>
                        <td>{event.startTime ?? "-"}</td>
                        <td>{event.eventType ?? "-"}</td>
                        <td>{event.venue.name ?? "-"}</td>
                        <td>{event.venue.address ?? "-"}</td>
                        <td>{event.host.name ?? "-"}</td>
                        <td>
                          <span
                            className={`badge ${event.genesys ? "badge-yes" : "badge-no"}`}
                          >
                            {event.genesys ? "Yes" : "No"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${event.dragonDuels ? "badge-yes" : "badge-no"}`}
                          >
                            {event.dragonDuels ? "Yes" : "No"}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </>
  );
}
