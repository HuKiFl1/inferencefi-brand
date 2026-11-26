import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initTheme } from "@shared/brand/setup";
import App, { type ScreenId } from "./App";

const theme = initTheme();
const params = new URLSearchParams(window.location.search);
const requested = params.get("screen");
const screen: ScreenId = requested === "pools" || requested === "lp" || requested === "dashboard" ? requested : "swap";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App initial={{ theme, screen, params }} />
  </StrictMode>,
);
