import { jsPDF } from "jspdf";
import { formatDate } from "@/lib/date";

const flatLabel = (flat) => (flat ? `${flat.blockName}-${flat.flatNumber}` : "—");
const dt = (iso) => formatDate(iso, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

/** Builds and downloads a compact visitor gate pass — a printable ID-badge-style card, not a full page. */
export function downloadVisitorPassPdf(visitor) {
  const W = 140;
  const H = 90;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [W, H] });

  // ---- Card border ----
  doc.setDrawColor(224, 224, 224);
  doc.setLineWidth(0.4);
  doc.roundedRect(1, 1, W - 2, H - 2, 4, 4, "S");

  // ---- Header strip ----
  doc.setFillColor(17, 17, 20);
  doc.roundedRect(1, 1, W - 2, 17, 4, 4, "F");
  doc.rect(1, 10, W - 2, 8, "F"); // square off the bottom corners of the header
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("SmartSociety", 8, 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(200, 200, 205);
  doc.text("VISITOR GATE PASS", W - 8, 11, { align: "right" });

  // ---- Status pill ----
  const statusLabel = { APPROVED: "APPROVED", CHECKED_IN: "CHECKED IN", COMPLETED: "COMPLETED", EXPIRED: "EXPIRED", CANCELLED: "CANCELLED" }[visitor.status] || visitor.status;
  const statusColor = visitor.status === "EXPIRED" || visitor.status === "CANCELLED" ? [220, 38, 38] : [16, 163, 74];
  doc.setFillColor(...statusColor);
  doc.roundedRect(W - 8 - doc.getTextWidth(statusLabel) - 6, 13.5, doc.getTextWidth(statusLabel) + 6, 4.2, 2, 2, "F");
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text(statusLabel, W - 8 - doc.getTextWidth(statusLabel) / 2 - 3, 16.2, { align: "center" });

  // ---- QR code (right side) ----
  const qrSize = 34;
  const qrX = W - 8 - qrSize;
  const qrY = 23;
  if (visitor.qrCodeDataUrl) {
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 2, 2, "S");
    doc.addImage(visitor.qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
  }
  doc.setFontSize(6);
  doc.setTextColor(150, 150, 150);
  doc.text("Scan at gate", qrX + qrSize / 2, qrY + qrSize + 4, { align: "center" });

  doc.setFontSize(6.5);
  doc.setTextColor(120, 120, 120);
  doc.text("GATE CODE", qrX + qrSize / 2, qrY + qrSize + 10, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(17, 17, 20);
  doc.text(visitor.passCode, qrX + qrSize / 2, qrY + qrSize + 16, { align: "center" });
  doc.setFont("helvetica", "normal");

  // ---- Visitor details (left side) ----
  const leftX = 8;
  let y = 25;

  doc.setFontSize(6.5);
  doc.setTextColor(150, 150, 150);
  doc.text("VISITOR NAME", leftX, y);
  y += 4.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(17, 17, 20);
  doc.text(visitor.visitorName, leftX, y, { maxWidth: qrX - leftX - 6 });
  doc.setFont("helvetica", "normal");

  y += 8;
  const field = (label, value) => {
    doc.setFontSize(6.5);
    doc.setTextColor(150, 150, 150);
    doc.text(label, leftX, y);
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text(String(value ?? "—"), leftX, y + 4, { maxWidth: qrX - leftX - 6 });
    y += 10.5;
  };

  field("PHONE", visitor.phone);
  field("PURPOSE", visitor.purpose || "—");
  field(
    "VISITING FLAT",
    `${flatLabel(visitor.targetFlatId)}${visitor.residentId?.name ? `  ·  ${visitor.residentId.name}` : ""}`
  );

  // ---- Footer strip: validity window ----
  doc.setFillColor(246, 246, 247);
  doc.rect(1, H - 15, W - 2, 14, "F");
  doc.setFontSize(6.5);
  doc.setTextColor(140, 140, 140);
  doc.text("VALID", leftX, H - 9.5);
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);
  doc.text(`${dt(visitor.validFrom)}  →  ${dt(visitor.validUntil)}`, leftX, H - 5);

  doc.setFontSize(6.5);
  doc.setTextColor(140, 140, 140);
  doc.text(visitor.visitorType?.toUpperCase() || "GUEST", W - 8, H - 5, { align: "right" });

  doc.save(`VisitorPass-${visitor.passCode}.pdf`);
}
