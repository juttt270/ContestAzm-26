import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { apiLimiter } from "./middlewares/rateLimiter.middleware.js";
import { notFound } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

/* ---------------------------- Global middlewares --------------------------- */
// Bulletproof CORS handling for preflight OPTIONS requests & all origins
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie"
    );
  }
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* --------------------------------- Routes --------------------------------- */
app.get("/", (_req, res) => {
  res.json({ message: "ContestAZM-2026 API is running", version: "v1" });
});

app.use("/api/v1", apiLimiter, routes);

/* ----------------------------- Error handling ------------------------------ */
app.use(notFound);
app.use(errorHandler);

export default app;
