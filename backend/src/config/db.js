import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

/** MongoDB Atlas se connection banata hai. */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

/** Server band hote waqt connection saaf tarike se close karta hai. */
export const disconnectDB = async () => {
  await mongoose.connection.close();
  logger.info("MongoDB disconnected");
};
