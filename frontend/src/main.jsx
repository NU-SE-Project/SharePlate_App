import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const rootElement = document.getElementById("root");
const app = <App />;
const shouldUseStrictMode = !import.meta.env.DEV;

createRoot(rootElement).render(
  shouldUseStrictMode ? <StrictMode>{app}</StrictMode> : app,
);
