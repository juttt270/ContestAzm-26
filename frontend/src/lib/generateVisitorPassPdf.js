import { jsPDF } from "jspdf";
import { formatDate } from "@/lib/date";

const flatLabel = (flat) => (flat ? `${flat.blockName}-${flat.flatNumber}` : "—");
const dt = (iso) => formatDate(iso, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Builds and downloads a printable visitor gate pass — QR code, gate code, and full visit details. */
export function downloadVisitorPassPdf(visitor) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("SmartSociety", 14, 18);
  doc.setFontSize(11);
  doc.text("Visitor Gate Pass", 14, 25);
  doc.setDrawColor(220, 220, 220);
  doc.line(14, 30, 196, 30);

  if (visitor.qrCodeDataUrl) {
    doc.addImage(visitor.qrCodeDataUrl, "PNG", 138, 38, 58, 58);
    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text("Scan at the gate", 138, 100, { maxWidth: 58 });
    doc.setTextColor(0);
  }

  doc.setFontSize(10);
  let y = 44;
  const row = (label, value) => {
    doc.text(label, 14, y);
    doc.text(String(value ?? "—"), 62, y, { maxWidth: 68 });
    y += 8;
  };

  row("Visitor Name", visitor.visitorName);
  row("Phone", visitor.phone);
  row("Vehicle Number", visitor.vehicleNumber && visitor.vehicleNumber !== "N/A" ? visitor.vehicleNumber : "—");
  row("Visitor Type", visitor.visitorType);
  row("Purpose", visitor.purpose || "—");
  row("Target Flat", flatLabel(visitor.targetFlatId));
  row("Issued By", visitor.residentId?.name || "—");
  row("Issued On", dt(visitor.createdAt));

  y += 4;
  doc.line(14, y, 196, y);
  y += 10;

  doc.setFontSize(11);
  doc.text("Gate Clearance Window", 14, y);
  y += 8;
  doc.setFontSize(10);
  row("Valid From", dt(visitor.validFrom));
  row("Valid Until", dt(visitor.validUntil));

  y += 6;
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text("Numeric Gate Code (manual fallback)", 14, y);
  doc.setTextColor(0);
  doc.setFontSize(22);
  doc.text(visitor.passCode, 14, y + 12);

  doc.setFontSize(9);
  doc.setTextColor(140);
  doc.text("Present this QR code or the numeric gate code at the security gate for entry.", 14, 280);

  doc.save(`VisitorPass-${visitor.passCode}.pdf`);
}
