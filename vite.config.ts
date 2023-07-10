import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import packageJson from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  define:  {
    'PACKAGE_VERSION': JSON.stringify(packageJson.version)
  },
  resolve: {
    alias: {
      src: "/src",
    },
  },
});
