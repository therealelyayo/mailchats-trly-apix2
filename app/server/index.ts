import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get the current file and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple logging function that works in both environments
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Serve static files in production
function serveStatic(app: any) {
  // In production, serve files from the 'dist' directory
  const distPath = path.resolve(__dirname, "../dist");

  if (!fs.existsSync(distPath)) {
    log(`Warning: Build directory not found at ${distPath}`, "production");
    return;
  }

  log(`Serving static files from ${distPath}`, "production");
  
  // Serve static files
  app.use(express.static(distPath));

  // Fall through to index.html for SPA routes
  app.use("*", (_req: any, res: any) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// Conditionally import Vite only in development
let setupVite: any;
if (process.env.NODE_ENV !== "production") {
  // Import dynamically to avoid loading in production
  import("./vite").then((viteModule) => {
    setupVite = viteModule.setupVite;
  }).catch(err => {
    console.error("Failed to load Vite module:", err);
  });
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    log("Starting server in development mode", "server");
    if (setupVite) {
      await setupVite(app, server);
    }
  } else {
    log("Starting server in production mode", "server");
    serveStatic(app);
  }

  const port = process.env.PORT || 3000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Server listening on port ${port}`, "server");
  });
})();