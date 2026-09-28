import "./PrivacyPolicyModal.css";

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export function PrivacyPolicyModal({ onClose }: PrivacyPolicyModalProps) {
  return (
    <div className="privacy-overlay" onClick={onClose}>
      <div className="privacy-card" onClick={(e) => e.stopPropagation()}>
        <div className="privacy-header">
          <h2>Privacy Policy</h2>
          <button
            type="button"
            className="privacy-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <p className="privacy-highlight-line">
          We never collect, store, or share the addresses you search with.
        </p>

        <div className="privacy-body">
          <section>
            <h3>What happens to the address you search</h3>
            <p>
              When you search for nearby events, the address you enter is
              sent to our server for one purpose only: converting it into map
              coordinates so we can find events near that location. That
              lookup is handled by our mapping provider, Mapbox. Once your
              search results come back, the address itself is discarded —
              it's never written to our database, logged, or linked to your
              account.
            </p>
          </section>

          <section>
            <h3>What we don't do</h3>
            <ul>
              <li>We don't store the addresses you search.</li>
              <li>
                We don't sell or share the addresses you search with third
                parties for marketing.
              </li>
              <li>
                We don't build a location history or profile tied to your
                account.
              </li>
            </ul>
          </section>

          <section>
            <h3>Your account</h3>
            <p>
              If you create an account, we store the account details you
              provide (like your name and email) through our authentication
              provider so you can sign back in. That's separate from, and
              unrelated to, any address you search.
            </p>
          </section>

          <section>
            <h3>Questions</h3>
            <p>
              If you have questions about this policy, reach out to the site
              owner.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
