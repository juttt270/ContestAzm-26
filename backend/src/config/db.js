import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

// Fix Windows DNS SRV lookup issues (querySrv ECONNREFUSED) on local ISP/networks
try {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Fallback if system environment overrides custom DNS servers
}


/** Connection options for production resiliency */
const MONGO_OPTIONS = {
  autoIndex: env.NODE_ENV !== "production", // Build indexes in dev, manage explicitly in prod
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

/** Setup lifecycle listeners on Mongoose connection */
const setupConnectionEvents = () => {
  mongoose.connection.on("connected", () => {
    logger.info("MongoDB Atlas event: Connected successfully");
  });

  mongoose.connection.on("error", (err) => {
    logger.error(`MongoDB Atlas event: Connection error - ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB Atlas event: Disconnected. Attempting reconnection...");
  });

  mongoose.connection.on("reconnected", () => {
    logger.info("MongoDB Atlas event: Reconnected successfully");
  });
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Initializes MongoDB Atlas connection with resilient retry logic.
 *  DNS lookups for the Atlas shard hosts occasionally fail transiently on some
 *  networks (ENOTFOUND) — a few short retries clear this up without needing a
 *  manual restart every time. */
export const connectDB = async (maxAttempts = 4) => {
  setupConnectionEvents();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const conn = await mongoose.connect(env.MONGO_URI, MONGO_OPTIONS);
      logger.info(`MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
      return conn;
    } catch (error) {
      logger.error(`MongoDB connection attempt ${attempt}/${maxAttempts} failed: ${error.message}`);
      if (attempt === maxAttempts) {
        logger.error("MongoDB connection failed after all retries. Exiting.");
        process.exit(1);
      }
      await sleep(1500 * attempt);
    }
  }
};

/** Gracefully closes MongoDB connection on server shutdown */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed cleanly");
  } catch (error) {
    logger.error(`Error during MongoDB disconnect: ${error.message}`);
  }
};

