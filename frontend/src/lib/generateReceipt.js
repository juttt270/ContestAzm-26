import { jsPDF } from "jspdf";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";

const flatLabel = (flat) => (flat ? `${flat.blockName}-${flat.flatNumber}` : "—");

/** Builds and downloads a simple PDF payment receipt for a paid maintenance bill. */
export function downloadBillReceipt(bill) {
  const doc = new jsPDF();
  const breakdown = bill.breakdown || {};

  doc.setFontSize(16);
  doc.text("SmartSociety", 14, 18);
  doc.setFontSize(11);
  doc.text("Maintenance Payment Receipt", 14, 25);

  doc.setDrawColor(220, 220, 220);
  doc.line(14, 30, 196, 30);

  doc.setFontSize(10);
  let y = 40;
  const row = (label, value) => {
    doc.text(label, 14, y);
    doc.text(String(value), 120, y);
    y += 8;
  };

  row("Receipt No.", `RCP-${bill.billNumber}`);
  row("Invoice No.", bill.billNumber);
  row("Flat", flatLabel(bill.flatId));
  row("Billing Month", bill.billingMonth);
  row("Payment Method", (bill.paymentMethod || "").replace(/_/g, " "));
  row("Transaction ID", bill.transactionId || "—");
  row("Paid On", formatDate(bill.paidAt));

  y += 4;
  doc.line(14, y, 196, y);
  y += 10;

  doc.setFontSize(11);
  doc.text("Charges Breakdown", 14, y);
  y += 8;
  doc.setFontSize(10);
  row("Water Charges", formatCurrency(breakdown.waterCharges || 0));
  row("Security Charges", formatCurrency(breakdown.securityCharges || 0));
  row("Repair Charges", formatCurrency(breakdown.repairCharges || 0));
  row("Common Area Charges", formatCurrency(breakdown.commonAreaCharges || 0));
  if (bill.penaltyAmount) row("Overdue Penalty", formatCurrency(bill.penaltyAmount));

  y += 4;
  doc.line(14, y, 196, y);
  y += 10;

  doc.setFontSize(13);
  doc.text("Total Paid", 14, y);
  doc.text(formatCurrency(bill.amountDue + (bill.penaltyAmount || 0)), 120, y);

  doc.save(`Receipt-${bill.billNumber}.pdf`);
}
