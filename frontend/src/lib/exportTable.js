import { utils, writeFile } from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function cellValue(column, row) {
  const raw = column.exportValue ? column.exportValue(row) : row[column.key];
  return raw ?? "";
}

export function exportToExcel({ columns, rows, fileName = "export" }) {
  const data = rows.map((row) =>
    Object.fromEntries(columns.map((column) => [column.header, cellValue(column, row)])),
  );
  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Sheet1");
  writeFile(workbook, `${fileName}.xlsx`);
}

export function exportToPdf({ columns, rows, fileName = "export", title }) {
  const doc = new jsPDF();

  if (title) {
    doc.setFontSize(13);
    doc.text(title, 14, 15);
  }

  autoTable(doc, {
    startY: title ? 21 : 12,
    head: [columns.map((column) => column.header)],
    body: rows.map((row) => columns.map((column) => String(cellValue(column, row)))),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [24, 24, 27] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`${fileName}.pdf`);
}
