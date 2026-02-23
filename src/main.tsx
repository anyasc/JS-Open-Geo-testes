import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/js/dist/tooltip";
import "bootstrap/js/dist/dropdown";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./custom.scss";
import "bootstrap";
import App from "./App.tsx";
import { AppProviders } from "./contexts/AppContext.tsx";
import { HashRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <AppProviders>
        <App />
      </AppProviders>
    </HashRouter>
  </StrictMode>,
);
