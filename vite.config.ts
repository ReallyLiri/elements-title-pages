import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { isNotesRequest, handleNotesRequest } from "./dev-server/notesHandler";
import type { ViteDevServer } from "vite";
import type { Connect } from "vite";
import type { IncomingMessage, ServerResponse } from "http";

function devApiPlugin(): Plugin {
  return {
    name: "dev-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(
        async (
          req: IncomingMessage,
          res: ServerResponse,
          next: Connect.NextFunction,
        ) => {
          if (isNotesRequest(req)) {
            await handleNotesRequest(req, res);
          } else {
            next();
          }
        },
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr(), devApiPlugin()],
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
  },
});
