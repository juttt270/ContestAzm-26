import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinary.js";
import { logger } from "./logger.js";
import ApiError from "./ApiError.js";

/**
 * Uploads a file from local temp storage to Cloudinary.
 * Automatically deletes local temporary file after upload or upon failure.
 *
 * @param {string} localFilePath - Local path of temporary file saved by Multer
 * @param {string} [folder="smart_society_uploads"] - Cloudinary folder destination
 * @returns {Promise<{ url: string, public_id: string, format: string, bytes: number } | null>}
 */
export const uploadOnCloudinary = async (localFilePath, folder = "smart_society_uploads") => {
  if (!localFilePath) return null;

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: "auto",
    });

    logger.info(`Cloudinary Upload Success: ${response.secure_url} (Public ID: ${response.public_id})`);

    // Clean up local temp file synchronously/asynchronously after success
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return {
      url: response.secure_url,
      public_id: response.public_id,
      format: response.format,
      bytes: response.bytes,
    };
  } catch (error) {
    logger.error(`Cloudinary Upload Failed: ${error.message}`);

    // Clean up local temp file on error to avoid disk leak
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    throw new ApiError(500, `Failed to upload image/asset to cloud storage: ${error.message}`);
  }
};

/**
 * Deletes an existing asset from Cloudinary using its public_id.
 *
 * @param {string} publicId - Cloudinary asset public ID
 * @param {string} [resourceType="image"] - Resource type ("image", "raw", "video")
 * @returns {Promise<boolean>}
 */
export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  if (!publicId) return false;

  try {
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (response.result === "ok") {
      logger.info(`Cloudinary Delete Success: ${publicId}`);
      return true;
    } else {
      logger.warn(`Cloudinary Delete Result Not OK: ${JSON.stringify(response)}`);
      return false;
    }
  } catch (error) {
    logger.error(`Cloudinary Delete Error for ${publicId}: ${error.message}`);
    return false;
  }
};
