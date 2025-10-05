import type { Connect, ViteDevServer } from "vite";
import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { handleNotesRequest, isNotesRequest } from "./dev-server/notesHandler";
import {
  handleEditionRequest,
  isEditionRequest,
} from "./dev-server/editionHandler";
import {
  handleImageUploadRequest,
  isImageUploadRequest,
} from "./dev-server/imageUploadHandler";
// @ts-expect-error js file
import { facsimileListingPlugin } from "./vite-plugins/facsimile-listing.js";
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
          } else if (isImageUploadRequest(req)) {
            await handleImageUploadRequest(req, res);
          } else if (isEditionRequest(req)) {
            await handleEditionRequest(req, res);
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
  plugins: [react(), svgr(), devApiPlugin(), facsimileListingPlugin()],
});
