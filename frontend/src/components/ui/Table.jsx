import { useMemo, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Menu from "@/components/ui/Menu";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import { IconSearch, IconDots, IconDownload, IconFileSpreadsheet, IconFilePdf } from "@/components/ui/icons";
import { exportToExcel, exportToPdf } from "@/lib/exportTable";

function cellText(column, row) {
  const value = column.searchValue ? column.searchValue(row) : row[column.key];
  return value == null ? "" : String(value);
}

export default function Table({
  title,
  columns,
  data,
  keyField = "_id",
  pageSize = 8,
  searchable = true,
  searchPlaceholder = "Search...",
  exportFileName,
  rowActions,
  headerAction,
  emptyIcon,
  emptyTitle = "No records found",
  emptyDescription,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.trim().toLowerCase();
    return data.filter((row) => columns.some((column) => cellText(column, row).toLowerCase().includes(q)));
  }, [data, columns, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const exportItems = exportFileName && [
    {
      label: "Export as Excel",
      icon: IconFileSpreadsheet,
      onClick: () => exportToExcel({ columns, rows: filtered, fileName: exportFileName }),
    },
    {
      label: "Export as PDF",
      icon: IconFilePdf,
      onClick: () => exportToPdf({ columns, rows: filtered, fileName: exportFileName, title }),
    },
  ];

  return (
    <div className="rounded-xl border border-line bg-surface">
      <div className="flex flex-col gap-3 border-b border-line-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
        <div className="flex flex-1 items-center justify-end gap-2.5">
          {searchable && (
            <Input
              icon={IconSearch}
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-60"
            />
          )}
          {exportItems && (
            <Menu
              align="right"
              trigger={
                <Button variant="outline" size="sm">
                  <IconDownload className="h-4 w-4" />
                  Export
                </Button>
              }
              items={exportItems}
            />
          )}
          {headerAction}
        </div>
      </div>

      {paginated.length === 0 ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="text-xs text-ink-faint">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`whitespace-nowrap px-5 py-2.5 font-semibold uppercase tracking-wide ${column.align === "right" ? "text-right" : ""}`}
                  >
                    {column.header}
                  </th>
                ))}
                {rowActions && <th className="px-5 py-2.5" />}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row) => (
                <tr key={row[keyField]} className="border-t border-line-soft transition hover:bg-surface-hover">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-5 py-3 ${column.align === "right" ? "text-right" : ""} ${column.className || "text-ink-dim"}`}
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-5 py-3 text-right">
                      <Menu
                        align="right"
                        trigger={
                          <button
                            type="button"
                            aria-label="Row actions"
                            className="rounded-md p-1.5 text-ink-faint transition hover:bg-surface-hover hover:text-ink"
                          >
                            <IconDots className="h-4 w-4" />
                          </button>
                        }
                        items={rowActions(row)}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <div className="border-t border-line-soft">
          <Pagination
            page={currentPage}
            pageCount={pageCount}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
