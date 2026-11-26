import { defineConfig } from "vite";
import { appConfig } from "../shared/vite/config.ts";

export default defineConfig(appConfig({ devPort: 47322, previewPort: 47332 }));
