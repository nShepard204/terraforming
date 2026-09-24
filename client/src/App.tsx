import "./App.css";
import axios from "axios";
import terraforming from "./assets/terraforming.png";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import {
  NeonAuthUIProvider,
  SignedIn,
  SignedOut,
  UserButton,
  authViewPaths,
  getViewByPath,
  type AuthViewPath,
} from "@neondatabase/auth-ui";
import { authClient } from "./lib/auth-client.ts";
import { AuthPrompt } from "./components/AuthPrompt/AuthPrompt.tsx";
import { AddEventModal } from "./components/AddEventModal/AddEventModal.tsx";
import { AddressSearch } from "./components/AddressSearch/AddressSearch.tsx";
import type { EventInfo } from "./lib/models.ts";
import { EventTable } from "./components/EventTable/EventTable.tsx";
import { useQuery } from "@tanstack/react-query";

const AUTH_SKIP_KEY = "terraforming:auth-skipped";
const distanceSelectors = [10, 50, 100, 150, 200, 250, 300];

function resolveAuthView(href: string): AuthViewPath | undefined {
  const segment = href.split("?")[0].split("/").filter(Boolean).pop();
  return getViewByPath(authViewPaths, segment) as AuthViewPath | undefined;
}

function App() {
  //const [events, setEvents] = useState<EventInfo[] | null>(null);
  const [userAddress, setUserAddress] = useState("");
  const [userDistance, setUserDistance] = useState(distanceSelectors[0]);
  const [authView, setAuthView] = useState<AuthViewPath>("SIGN_IN");
  const [authSkipped, setAuthSkipped] = useState(
    () => localStorage.getItem(AUTH_SKIP_KEY) === "true",
  );
  const [showAddEvent, setShowAddEvent] = useState(false);

  // Tanstack Queries.
  const nearbyEventsQuery = useQuery({
    queryKey: ["nearby-events"],
    queryFn: async () => {
      const requestUrl = `${import.meta.env.VITE_BACKEND_URL}/events/search-nearby`;

      const response = await axios.get<EventInfo[]>(requestUrl, {
        params: {
          address: userAddress,
          distance: userDistance,
        },
      });

      return response.data;
    },
    enabled: false,
  });

  const handleAuthNavigate = useCallback((href: string) => {
    const view = resolveAuthView(href);
    if (view === "SIGN_OUT") {
      authClient.signOut();
      return;
    }
    const nextView = view ?? "SIGN_IN";
    //@ts-ignore
    setAuthView((prevView) => {
      // Some auth-ui views (e.g. Forgot Password) navigate "back" via
      // window.history.back() instead of our Link/navigate overrides, so a
      // history entry needs to exist for that button to land back on sign-in
      // instead of leaving the app.
      if (nextView !== "SIGN_IN" && prevView !== nextView) {
        window.history.pushState({ authView: nextView }, "");
      }
      return nextView;
    });
  }, []);

  useEffect(() => {
    function handlePopState() {
      setAuthView("SIGN_IN");
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const AuthLink = useCallback(
    ({
      href,
      className,
      children,
    }: {
      href: string;
      className?: string;
      children: ReactNode;
    }) => (
      <a
        href={href}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          handleAuthNavigate(href);
        }}
      >
        {children}
      </a>
    ),
    [handleAuthNavigate],
  );

  function handleSkipAuth() {
    localStorage.setItem(AUTH_SKIP_KEY, "true");
    setAuthSkipped(true);
  }

  function handleShowLogin() {
    setAuthView("SIGN_IN");
    localStorage.removeItem(AUTH_SKIP_KEY);
    setAuthSkipped(false);
  }

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={handleAuthNavigate}
      Link={AuthLink}
      account={false}
      defaultTheme="dark"
    >
      <Toaster theme="dark" richColors />
      <div className="page">
        <div className="account-bar">
          <SignedIn>
            <button
              className="account-bar-add-event"
              onClick={() => setShowAddEvent(true)}
            >
              + Add Event
            </button>
            <UserButton size="icon" />
          </SignedIn>
          <SignedOut>
            {authSkipped && (
              <button className="account-bar-login" onClick={handleShowLogin}>
                Log in
              </button>
            )}
          </SignedOut>
        </div>

        {showAddEvent && (
          <AddEventModal
            onClose={() => setShowAddEvent(false)}
            onCreated={() => {
              if (userAddress) {
                nearbyEventsQuery.refetch();
              }
            }}
          />
        )}

        <header className="hero">
          <img className="hero-logo" src={terraforming} alt="" />
          <h1>Terraforming</h1>
          <p className="tagline">Find nearby Yu-Gi-Oh! events</p>
        </header>

        <section className="search-card">
          <div className="field">
            <label>Address</label>
            <AddressSearch
              placeholder="Enter your address"
              address={userAddress}
              setAddress={setUserAddress}
            />
          </div>
          <div className="field">
            <label htmlFor="user-distance">Distance (mi)</label>
            <select
              id="user-distance"
              value={userDistance}
              onChange={(e) => setUserDistance(parseInt(e.target.value))}
            >
              {distanceSelectors.map((distance) => (
                <option key={distance} value={distance}>
                  {distance}
                </option>
              ))}
            </select>
          </div>
          <button
            className={`search-button${nearbyEventsQuery.isFetching ? " loading" : ""}`}
            onClick={() => nearbyEventsQuery.refetch()}
            disabled={userAddress === "" || nearbyEventsQuery.isFetching}
          >
            {nearbyEventsQuery.isFetching ? (
              <span className="spinner" aria-label="Loading" />
            ) : (
              "Find Events"
            )}
          </button>
        </section>

        <EventTable events={nearbyEventsQuery.data ?? null} />
      </div>

      <SignedOut>
        {!authSkipped && <AuthPrompt view={authView} onSkip={handleSkipAuth} />}
      </SignedOut>
    </NeonAuthUIProvider>
  );
}

export default App;
