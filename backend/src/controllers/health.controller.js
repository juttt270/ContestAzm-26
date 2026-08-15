import mongoose from "mongoose";
import { env } from "../config/env.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const DB_STATES = ["disconnected", "connected", "connecting", "disconnecting"];

/** GET /api/v1/health — frontend isi se connection check karta hai. */
export const getHealth = asyncHandler(async (_req, res) => {
  ApiResponse.send(
    res,
    200,
    {
      status: "ok",
      environment: env.NODE_ENV,
      database: DB_STATES[mongoose.connection.readyState] ?? "unknown",
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
    },
    "Server is healthy"
  );
});
