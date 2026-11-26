import { defineConfig } from "vite";
import { appConfig } from "../shared/vite/config.ts";

export default defineConfig(appConfig({ devPort: 47321, previewPort: 47331 }));
