import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

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

/** Initializes MongoDB Atlas connection with resilient retry logic */
export const connectDB = async () => {
  setupConnectionEvents();

  try {
    const conn = await mongoose.connect(env.MONGO_URI, MONGO_OPTIONS);
    logger.info(`MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB initial connection failure: ${error.message}`);
    process.exit(1);
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

