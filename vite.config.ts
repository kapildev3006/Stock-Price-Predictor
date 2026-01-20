import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: "./client",
  server: {
    host: "localhost",
    port: 8080,
    fs: {
      allow: [".", "../shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "../server/**"],
    },
  },
  build: {
    outDir: "../dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Only use Express for API routes, everything else goes to Vite
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api')) {
          // Let Express handle API routes
          // @ts-ignore - Type compatibility between Connect and Express middleware
          app(req, res, next);
        } else {
          // Let Vite handle everything else (frontend)
          next();
        }
      });
    },
  };
}
