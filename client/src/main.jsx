import React from "react";
import ReactDOM from "react-dom/client";

// Registers <model-viewer> as a browser custom element globally.
// Must be imported once at the entry point before any component uses it.
import "@google/model-viewer";

import App from "./App";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);