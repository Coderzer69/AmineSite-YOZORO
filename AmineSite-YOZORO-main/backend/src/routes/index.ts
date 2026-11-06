import type { Express } from "express";
import { Router as createRouter } from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "../config/env.js";
import { authRoutes } from "./auth.routes.js";
import { animeRoutes } from "./anime.routes.js";
import { uploadRoutes } from "./upload.routes.js";
import { workerRoutes } from "./worker.routes.js";
import { playbackRoutes } from "./playback.routes.js";
import { userRoutes } from "./user.routes.js";
import { adminRoutes } from "./admin.routes.js";
import { commentRoutes } from "./comment.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function registerRoutes(app: Express): void {
  const v1Router = createRouter();

  // Root welcome route for versioned API
  v1Router.get("/", (_req, res) => {
    res.json({
      name: "YOZORO Streaming API",
      version: "1.0.0",
      documentation: `${env.API_PREFIX}/docs`,
      endpoints: {
        anime: `${env.API_PREFIX}/anime`,
        auth: `${env.API_PREFIX}/auth`,
        playback: `${env.API_PREFIX}/playback`,
        user: `${env.API_PREFIX}/user`,
        admin: `${env.API_PREFIX}/admin`,
        comments: `${env.API_PREFIX}/comments`,
      },
    });
  });

  // Mount Swagger / OpenAPI Documentation
  try {
    const swaggerDocument = YAML.load(path.join(__dirname, "../../docs/openapi.yaml"));
    v1Router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } catch (err) {
    // If docs cannot load in minimal test runtime
  }

  // Mount Feature Routes
  v1Router.use("/auth", authRoutes);
  v1Router.use("/anime", animeRoutes);
  v1Router.use("/uploads", uploadRoutes);
  v1Router.use("/worker", workerRoutes);
  v1Router.use("/playback", playbackRoutes);
  v1Router.use("/user", userRoutes);
  v1Router.use("/admin", adminRoutes);
  v1Router.use("/comments", commentRoutes);

  // Mount versioned router: /api/v1
  app.use(env.API_PREFIX, v1Router);

  // Mount compatibility alias: /api
  if (env.API_PREFIX !== "/api") {
    app.use("/api", v1Router);
  }
}
