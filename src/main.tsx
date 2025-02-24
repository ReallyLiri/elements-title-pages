import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "react-tooltip/dist/react-tooltip.css";
import App from "./App.tsx";
import { Tooltip } from "react-tooltip";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Tooltip
      id="features"
      style={{
        backgroundColor: "white",
        color: "black",
        padding: "1rem",
        fontSize: "1.2rem",
      }}
    />
  </StrictMode>,
);
