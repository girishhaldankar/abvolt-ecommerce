import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";
import * as XLSX from "xlsx";
import { getAllDivisions } from "../../services/divisions.service";
import {
  CategoryImportCommitResult,
  CategoryImportPayload,
  CategoryImportPreview,
  CategoryImportRow,
  CATEGORY_IMPORT_COLUMNS,
  commitCategoryImport,
  previewCategoryImport,
} from "../../services/categoryImport.service";

import AdminSidebar from "./AdminSidebar";

/* ---------------------------------------------
   SAFE LUCIDE ICON RENDERER
--------------------------------------------- */
const RenderIcon = ({
  name,
  size = 16,
  fallback = "Folder",
}: {
  name?: string;
  size?: number;
  fallback?: keyof typeof Icons;
}) => {
  const IconComp = (Icons as any)[name || ""] || (Icons as any)[fallback];
  return IconComp ? <IconComp size={size} /> : null;
};

/* ---------------------------------------------
   TYPE DEFINITIONS
--------------------------------------------- */
interface Category {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  icon?: string;
  image?: string;
  items?: Item[];
}

interface Item {
  id?: string;
  _id?: string;
  title: string;
  code?: string;
  shortDescription?: string;
  fullDescription?: string;
  features?: string[];
  image?: string;
  icon?: string;
  price?: number;
  path?: string;
}

interface Stream {
  id: string;
  _id?: string;
  title: string;
  icon?: string;
  categories?: Category[];
}

interface Audience {
  id: string;
  _id?: string;
  title: string;
  icon?: string;
  streams?: Stream[];
}

interface Division {
  id: string;
  _id?: string;
  title: string;
  icon?: string;
  description?: string;
  audiences?: Audience[];
}

const getRecordId = (record: { id?: string; _id?: string }) =>
  record.id || record._id || "";

const MAX_IMPORT_ROWS = 500;
const MAX_IMPORT_BYTES = 1024 * 1024;

interface CategoryImportSession {
  fileName: string;
  importId: string;
  payload: CategoryImportPayload;
  preview: CategoryImportPreview;
  multipleDivisions: boolean;
}

function cellToText(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value);
}

function isBlankRow(row: unknown[]): boolean {
  return row.every((cell) => cellToText(cell).trim() === "");
}

function getPayloadSize(payload: unknown): number {
  return new TextEncoder().encode(JSON.stringify(payload)).byteLength;
}

/* ---------------------------------------------
   STAT COMPONENT
--------------------------------------------- */
const Stat = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div className="text-center">
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-gray-600 mt-1">{label}</p>
  </div>
);

/* ---------------------------------------------
   MAIN COMPONENT
--------------------------------------------- */
export default function AdminDashboard() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [divisionLoadError, setDivisionLoadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [isPreviewingImport, setIsPreviewingImport] = useState(false);
  const [isCommittingImport, setIsCommittingImport] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSession, setImportSession] =
    useState<CategoryImportSession | null>(null);
  const [commitResult, setCommitResult] =
    useState<CategoryImportCommitResult | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const commitInProgressRef = useRef(false);

  useEffect(() => {
    document.documentElement.classList.remove("dark"); // force light mode
    const fetchDivisions = async () => {
      try {
        setLoading(true);
        const data = await getAllDivisions();
        setDivisions(data);
      } catch (err) {
        console.error("Error fetching divisions:", err);
        setDivisionLoadError(
          err instanceof Error ? err.message : "Failed to load divisions."
        );
        
      } finally {
        setLoading(false);
      }
    };

    fetchDivisions();
  }, []);

  const handleExcelExport = async () => {
    setIsExporting(true);
    setExportError("");

    try {
      const allDivisions: Division[] = await getAllDivisions();
      if (!Array.isArray(allDivisions)) {
        throw new Error("The server returned unexpected data for export.");
      }

      const categoryRows: string[][] = [];

      allDivisions.forEach((division) => {
        const divisionId = getRecordId(division);

        (Array.isArray(division.audiences) ? division.audiences : []).forEach(
          (audience) => {
            const audienceId = getRecordId(audience);
            (Array.isArray(audience.streams) ? audience.streams : []).forEach(
              (stream) => {
                const streamId = getRecordId(stream);
                (Array.isArray(stream.categories) ? stream.categories : []).forEach(
                  (category) => {
                    const categoryValues = [
                      divisionId,
                      division.title || "",
                      audienceId,
                      audience.title || "",
                      streamId,
                      stream.title || "",
                      getRecordId(category),
                      category.title || "",
                      category.description || "",
                      category.icon || "",
                      category.image || "",
                    ];
                    const items = Array.isArray(category.items) ? category.items : [];
                    if (items.length === 0) {
                      categoryRows.push([
                        ...categoryValues,
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                      ]);
                      return;
                    }

                    items.forEach((item) => {
                      categoryRows.push([
                        ...categoryValues,
                        getRecordId(item),
                        item.title || "",
                        item.code || "",
                        item.shortDescription || "",
                        item.fullDescription || "",
                        Array.isArray(item.features) && item.features.length > 0
                          ? item.features.join("\n")
                          : "",
                        item.image || "",
                        item.icon || "",
                        item.price === undefined || item.price === null
                          ? ""
                          : String(item.price),
                        item.path || "",
                      ]);
                    });
                  }
                );
              }
            );
          }
        );
      });

      console.info("Excel export category count", categoryRows.length);

      const workbook = XLSX.utils.book_new();
      const headers = [...CATEGORY_IMPORT_COLUMNS];
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...categoryRows]);
      worksheet["!cols"] = [
        { wch: 26 },
        { wch: 24 },
        { wch: 26 },
        { wch: 24 },
        { wch: 26 },
        { wch: 24 },
        { wch: 26 },
        { wch: 32 },
        { wch: 48 },
        { wch: 20 },
        { wch: 48 },
        { wch: 26 },
        { wch: 32 },
        { wch: 24 },
        { wch: 40 },
        { wch: 60 },
        { wch: 40 },
        { wch: 48 },
        { wch: 20 },
        { wch: 18 },
        { wch: 36 },
      ];
      worksheet["!autofilter"] = { ref: `A1:U${categoryRows.length + 1}` };
      XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

      XLSX.writeFile(workbook, "Abvolt-Categories.xlsx", { bookType: "xlsx" });
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "Failed to export Excel workbook."
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImportSession(null);
    setCommitResult(null);
    setImportError("");

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setImportError("Please select an .xlsx workbook.");
      return;
    }

    setIsPreviewingImport(true);
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), {
        type: "array",
        cellText: true,
        cellDates: false,
      });
      const worksheet = workbook.Sheets.Categories;
      if (!worksheet) {
        throw new Error('The workbook must contain a worksheet named "Categories".');
      }

      const worksheetRows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
        header: 1,
        raw: false,
        defval: "",
        blankrows: true,
      });
      const headerRow = worksheetRows[0] || [];
      const headers = headerRow.map((cell) => cellToText(cell).trim());
      if (
        headers.length !== CATEGORY_IMPORT_COLUMNS.length ||
        !CATEGORY_IMPORT_COLUMNS.every(
          (column, index) => headers[index] === column
        )
      ) {
        throw new Error(
          `The Categories worksheet must have these exact headers, in order: ${CATEGORY_IMPORT_COLUMNS.join(", ")}`
        );
      }

      const dataRows = worksheetRows.slice(1);
      while (dataRows.length > 0 && isBlankRow(dataRows[dataRows.length - 1])) {
        dataRows.pop();
      }
      if (dataRows.length === 0 || dataRows.every(isBlankRow)) {
        throw new Error("The workbook contains no category data rows.");
      }
      if (dataRows.length > MAX_IMPORT_ROWS) {
        throw new Error(`A maximum of ${MAX_IMPORT_ROWS} data rows can be imported at once.`);
      }

      const rows: CategoryImportRow[] = dataRows.map((row, index) => {
        const extraValues = row.slice(CATEGORY_IMPORT_COLUMNS.length);
        if (extraValues.some((value) => cellToText(value).trim() !== "")) {
          throw new Error(
            `Excel row ${index + 2} contains data beyond the expected ${CATEGORY_IMPORT_COLUMNS.length} columns.`
          );
        }

        return Object.fromEntries(
          CATEGORY_IMPORT_COLUMNS.map((column, columnIndex) => [
            column,
            cellToText(row[columnIndex]),
          ])
        ) as CategoryImportRow;
      });

      const divisionIds = new Set(
        rows
          .map((row) => row.divisionId.trim().toLowerCase())
          .filter(Boolean)
      );
      const payload: CategoryImportPayload = {
        columns: CATEGORY_IMPORT_COLUMNS,
        rows,
      };
      if (getPayloadSize(payload) > MAX_IMPORT_BYTES) {
        throw new Error("The import data exceeds the backend's 1 MB request limit.");
      }

      if (!globalThis.crypto?.randomUUID) {
        throw new Error("This browser cannot create a secure import session ID.");
      }
      const importId = globalThis.crypto.randomUUID();
      if (getPayloadSize({ ...payload, importId }) > MAX_IMPORT_BYTES) {
        throw new Error("The commit request exceeds the backend's 1 MB request limit.");
      }
      const preview = await previewCategoryImport(payload);
      setImportSession({
        fileName: file.name,
        importId,
        payload,
        preview,
        multipleDivisions: divisionIds.size > 1,
      });
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : "Unable to preview this workbook."
      );
    } finally {
      setIsPreviewingImport(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importSession || isCommittingImport || commitInProgressRef.current) return;

    const { categoriesCreated, categoriesUpdated, itemsCreated, itemsUpdated } =
      importSession.preview.summary;
    const confirmed = window.confirm(
      `Create ${categoriesCreated} categor${categoriesCreated === 1 ? "y" : "ies"}, update ${categoriesUpdated} categor${categoriesUpdated === 1 ? "y" : "ies"}, create ${itemsCreated} item${itemsCreated === 1 ? "" : "s"}, and update ${itemsUpdated} item${itemsUpdated === 1 ? "" : "s"}?`
    );
    if (!confirmed) return;

    commitInProgressRef.current = true;
    setIsCommittingImport(true);
    setImportError("");
    setCommitResult(null);
    try {
      const result = await commitCategoryImport(
        importSession.payload,
        importSession.importId
      );
      setCommitResult(result);

      if (result.committed) {
        try {
          const refreshedDivisions = await getAllDivisions();
          setDivisions(refreshedDivisions);
        } catch {
          setImportError(
            "Import succeeded, but the dashboard could not refresh. Reload the dashboard data to see the changes."
          );
        }
      }
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : "Category import failed."
      );
    } finally {
      commitInProgressRef.current = false;
      setIsCommittingImport(false);
    }
  };

  /* Helper functions for totals */
  const countStreams = (audiences?: Audience[]) =>
    audiences?.reduce(
      (total, audience) =>
        total +
        (Array.isArray(audience.streams) ? audience.streams.length : 0),
      0
    ) || 0;

  const countCategories = (audiences?: Audience[]) =>
    audiences?.reduce(
      (total, audience) =>
        total +
        (Array.isArray(audience.streams) ? audience.streams : []).reduce(
          (streamTotal, stream) =>
            streamTotal +
            (Array.isArray(stream.categories) ? stream.categories.length : 0),
          0
        ),
      0
    ) || 0;

  const countItems = (audiences?: Audience[]) =>
    audiences?.reduce(
      (total, audience) =>
        total +
        (Array.isArray(audience.streams) ? audience.streams : []).reduce(
          (streamTotal, stream) =>
            streamTotal +
            (Array.isArray(stream.categories) ? stream.categories : []).reduce(
              (categoryTotal, category) =>
                categoryTotal +
                (Array.isArray(category.items) ? category.items.length : 0),
              0
            ),
          0
        ),
      0
    ) || 0;

  const filteredDivisions = divisions.filter((division) => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return (
      !query ||
      division.title?.toLocaleLowerCase().includes(query) ||
      division.description?.toLocaleLowerCase().includes(query)
    );
  });

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <AdminSidebar />

      <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">
            Search and manage your divisions
          </p>
        </div>

        {/* DASHBOARD ACTIONS */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            to="/admin/division/new"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white shadow transition hover:bg-green-700"
          >
            <Icons.Plus size={18} />
            Add New Division
          </Link>
          <button
            type="button"
            onClick={handleExcelExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icons.Download size={18} />
            {isExporting ? "Preparing Excel..." : "Download Excel"}
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            disabled={isPreviewingImport || isCommittingImport}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icons.Upload size={18} />
            {isPreviewingImport ? "Previewing Excel..." : "Upload Excel"}
          </button>
        </div>
        {exportError && (
          <p className="mb-6 rounded border border-red-300 bg-red-100 p-3 text-sm text-red-700" role="alert">
            {exportError}
          </p>
        )}
        {importError && (
          <p className="mb-6 rounded border border-red-300 bg-red-100 p-3 text-sm text-red-700" role="alert">
            {importError}
          </p>
        )}
        {isPreviewingImport && (
          <div className="mb-6 rounded border bg-white p-4 text-gray-700" role="status">
            Reading workbook and validating category rows...
          </div>
        )}
        {importSession && (
          <section className="mb-8 rounded-lg border bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Category Import Preview</h2>
            <p className="mt-1 text-sm text-gray-600">
              Workbook: <span className="font-medium">{importSession.fileName}</span>
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Total rows" value={importSession.preview.summary.total} color="text-gray-800" />
              <Stat label="Categories to create" value={importSession.preview.summary.categoriesCreated} color="text-green-600" />
              <Stat label="Categories to update" value={importSession.preview.summary.categoriesUpdated} color="text-blue-600" />
              <Stat label="Items to create" value={importSession.preview.summary.itemsCreated} color="text-green-700" />
              <Stat label="Items to update" value={importSession.preview.summary.itemsUpdated} color="text-blue-700" />
              <Stat label="Invalid rows" value={importSession.preview.summary.invalid} color="text-red-600" />
            </div>

            {importSession.preview.rows.some((row) => row.errors.length > 0) && (
              <div className="mt-5 max-h-64 space-y-2 overflow-y-auto rounded border border-red-200 bg-red-50 p-3">
                {importSession.preview.rows
                  .filter((row) => row.errors.length > 0)
                  .map((row) => (
                    <div key={row.rowNumber} className="text-sm text-red-800">
                      <strong>Excel row {row.rowNumber}:</strong>{" "}
                      {row.errors.join("; ")}
                    </div>
                  ))}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={
                  !importSession.preview.valid ||
                  importSession.preview.summary.invalid !== 0 ||
                  importSession.multipleDivisions ||
                  isCommittingImport ||
                  Boolean(commitResult?.committed)
                }
                className="rounded bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCommittingImport ? "Importing..." : "Confirm Import"}
              </button>
              {!importSession.preview.valid && (
                <span className="text-sm text-red-700">
                  Resolve the validation errors before confirming.
                </span>
              )}
              {importSession.multipleDivisions && (
                <span className="text-sm text-red-700">
                  This workbook contains multiple Divisions. Import one Division at a time.
                </span>
              )}
            </div>
          </section>
        )}
        {commitResult && (
          <section
            className={`mb-8 rounded-lg border p-5 ${
              commitResult.committed
                ? "border-green-300 bg-green-50"
                : "border-red-300 bg-red-50"
            }`}
            role="status"
          >
            <h2 className="text-lg font-semibold">
              {commitResult.committed ? "Import completed" : "Import was not committed"}
            </h2>
            <p className="mt-1 text-sm">
              {commitResult.committed
                ? `Backend confirmed ${commitResult.summary.categoriesCreated} categories created, ${commitResult.summary.categoriesUpdated} categories updated, ${commitResult.summary.itemsCreated} items created, ${commitResult.summary.itemsUpdated} items updated, and ${commitResult.summary.categoriesAlreadyImported + commitResult.summary.itemsAlreadyImported} records already imported.`
                : "Backend validation rejected the import. No rows were committed."}
            </p>
            <div className="mt-3 max-h-56 space-y-1 overflow-y-auto text-sm">
              {commitResult.rows.map((row) => (
                <p key={row.rowNumber}>
                  <strong>Excel row {row.rowNumber}:</strong>{" "}
                  {row.errors.length
                    ? row.errors.join("; ")
                    : `Category ${row.categoryAction || "unchanged"}${row.categoryId ? ` (${row.categoryId})` : ""}${row.itemAction ? `; item ${row.itemAction}${row.itemId ? ` (${row.itemId})` : ""}` : ""}`}
                </p>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="divisions-heading">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="divisions-heading" className="text-xl font-semibold">
                Divisions
              </h2>
              {!loading && !divisionLoadError && (
                <p className="mt-1 text-sm text-gray-500">
                  {filteredDivisions.length} of {divisions.length}{" "}
                  {divisions.length === 1 ? "division" : "divisions"}
                </p>
              )}
            </div>
            <label className="relative block w-full sm:max-w-sm">
              <Icons.Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search divisions by name or description"
                aria-label="Search divisions by name or description"
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </label>
          </div>

          {loading ? (
            <div className="flex justify-center rounded-lg border bg-white py-12">
              <div
                className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"
                role="status"
                aria-label="Loading divisions"
              />
            </div>
          ) : divisionLoadError ? (
            <div
              className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800"
              role="alert"
            >
              Unable to load divisions: {divisionLoadError}
            </div>
          ) : divisions.length === 0 ? (
            <div className="rounded-lg border bg-white px-4 py-10 text-center text-gray-600">
              No divisions found. Add a division to get started.
            </div>
          ) : filteredDivisions.length === 0 ? (
            <div className="rounded-lg border bg-white px-4 py-10 text-center text-gray-600">
              No divisions match “{searchQuery.trim()}”.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDivisions.map((division) => {
                const divisionId = getRecordId(division);
                const audiences = Array.isArray(division.audiences)
                  ? division.audiences
                  : [];
                const counts = [
                  { label: "Audiences", value: audiences.length },
                  { label: "Streams", value: countStreams(audiences) },
                  { label: "Categories", value: countCategories(audiences) },
                  { label: "Items", value: countItems(audiences) },
                ];

                return (
                  <article
                    key={divisionId || division.title}
                    className="rounded-lg border bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow sm:p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                          <RenderIcon
                            name={division.icon}
                            size={20}
                            fallback="Building2"
                          />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-semibold">
                            {division.title || "Untitled Division"}
                          </h3>
                          {division.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                              {division.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-4 lg:min-w-[22rem]">
                        {counts.map(({ label, value }) => (
                          <div key={label} className="flex items-baseline gap-2">
                            <span className="text-lg font-semibold text-gray-900">
                              {value}
                            </span>
                            <span className="text-xs text-gray-500">{label}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Link
                          to={`/admin/division/${divisionId}/manage`}
                          className="inline-flex items-center justify-center rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Manage Division
                        </Link>
                        <Link
                          to={`/admin/division/${divisionId}`}
                          className="inline-flex items-center justify-center rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Edit Division
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
