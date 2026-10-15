import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const projectDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react({ include: /\.[jt]sx?$/ })],
  oxc: {
    include: /\.[jt]sx?$/,
    exclude: [],
    lang: "jsx",
    jsx: {
      runtime: "automatic",
    },
  },
  resolve: {
    alias: {
      "@": path.join(projectDirectory, "src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});