import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initTheme } from "@shared/brand/setup";
import App from "./App";

const theme = initTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App initialTheme={theme} />
  </StrictMode>,
);
