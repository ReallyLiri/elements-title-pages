import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "react-tooltip/dist/react-tooltip.css";
import App from "./App.tsx";
import { Tooltip } from "react-tooltip";
import { MapTooltips } from "./components/map/MapTooltips.tsx";
import { FilterProvider } from "./contexts/FilterContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FilterProvider>
      <App />
      <Tooltip
        id="features"
        delayHide={200}
        clickable
        style={{
          zIndex: 2,
          backgroundColor: "white",
          color: "black",
          padding: "1rem",
          fontSize: "1.2rem",
          maxWidth: 600,
        }}
      />
      <MapTooltips />
    </FilterProvider>
  </StrictMode>,
);
