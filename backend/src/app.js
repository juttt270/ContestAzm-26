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
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL, // frontend ka localhost URL .env se aata hai
    credentials: true,
  })
);
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
