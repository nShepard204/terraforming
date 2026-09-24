import { Geocoder } from "@mapbox/search-js-react";

interface AddressSearchProps {
  placeholder: string;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
}

const geocoderTheme = {
  variables: {
    colorText: "var(--color-text)",
    colorPrimary: "var(--color-primary)",
    colorSecondary: "var(--color-text-muted)",
    colorBackground: "var(--color-bg)",
    colorBackgroundHover: "var(--color-tint)",
    colorBackgroundActive: "var(--color-tint)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(45, 212, 232, 0.1)",
    fontFamily:
      '"Segoe UI", system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif',
  },
};

export function AddressSearch({
  placeholder,
  address,
  setAddress,
}: AddressSearchProps) {
  return (
    <Geocoder
      accessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
      options={{ types: new Set(["address"]) }}
      theme={geocoderTheme}
      placeholder={placeholder}
      value={address}
      onChange={setAddress}
      onRetrieve={(feature) => setAddress(feature.properties.full_address)}
      onClear={() => setAddress("")}
    />
  );
}
