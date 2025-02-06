import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

import packageJson from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr(), tailwindcss()],
  define: {
    "import.meta.env.PACKAGE_VERSION": JSON.stringify(packageJson.version),
  },
  resolve: {
    alias: {
      src: "/src",
    },
  },
  assetsInclude: ["**/*.mp3"],
});
