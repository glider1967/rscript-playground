import { render } from "preact";
import { App } from "./app.tsx";
import "./index.css";
import { ErrorBoundary, LocationProvider } from "preact-iso";

render(
  <LocationProvider scope="/rscript-playground">
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </LocationProvider>,
  document.getElementById("app")!
);
