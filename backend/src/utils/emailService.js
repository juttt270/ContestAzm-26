import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

let transporter = null;

const getTransporter = () => {
  if (!env.EMAIL_USER || !env.EMAIL_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
    });
  }
  return transporter;
};

const wrap = (title, bodyHtml) => `
  <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff;">
    <div style="background: #18181b; padding: 24px 28px;">
      <span style="color: #ffffff; font-size: 18px; font-weight: 700;">SmartSociety</span>
    </div>
    <div style="padding: 28px; color: #27272a;">
      <h2 style="margin: 0 0 16px; font-size: 18px;">${title}</h2>
      ${bodyHtml}
    </div>
    <div style="padding: 16px 28px; border-top: 1px solid #e4e4e7; color: #a1a1aa; font-size: 12px;">
      SmartSociety — Society Management Platform
    </div>
  </div>
`;

/** Fire-and-forget — never throws, so a failed/unconfigured email never blocks the calling action. */
export const sendEmail = async ({ to, subject, title, bodyHtml }) => {
  try {
    const t = getTransporter();
    if (!t || !to) return;
    await t.sendMail({
      from: `"SmartSociety" <${env.EMAIL_USER}>`,
      to,
      subject,
      html: wrap(title, bodyHtml),
    });
  } catch (err) {
    logger.warn(`Email send failed: ${err.message}`);
  }
};

/** Sends the same email to a list of recipients, skipping empty/duplicate addresses. */
export const sendBulkEmail = async ({ recipients, subject, title, bodyHtml }) => {
  const unique = [...new Set((recipients || []).filter(Boolean))];
  await Promise.all(unique.map((to) => sendEmail({ to, subject, title, bodyHtml })));
};
