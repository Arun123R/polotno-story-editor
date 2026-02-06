import "./editorBootstrap"; // Initialize auth and context immediately
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import { registerInteractiveElement } from "./components/interactive/registerInteractiveElement";

// Tailwind styles
// Polotno UI + Blueprint styles (required for canvas and controls)
import "polotno/polotno.blueprint.css";
import "./styles/index.css";

// Register custom interactive element type
registerInteractiveElement();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
