import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronDown,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import * as XLSX from "xlsx";
import { deleteAudience } from "../../services/audiences.service";
import { deleteCategory } from "../../services/categories.service";
import { deleteDivision, getDivisionById } from "../../services/divisions.service";
import { deleteItem } from "../../services/items.service";
import { deleteStream } from "../../services/streams.service";
import {
  CategoryImportCommitResult,
  CategoryImportPayload,
  CategoryImportPreview,
  CategoryImportRow,
  CATEGORY_IMPORT_COLUMNS,
  commitDivisionCategoryImport,
  previewDivisionCategoryImport,
} from "../../services/categoryImport.service";

interface Item {
  id?: string;
  _id?: string;
  title?: string;
  code?: string;
  shortDescription?: string;
  fullDescription?: string;
  features?: string[];
  image?: string;
  icon?: string;
  price?: number;
  path?: string;
}

interface Category {
  id?: string;
  _id?: string;
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
  items?: Item[];
}

interface Stream {
  id?: string;
  _id?: string;
  title?: string;
  icon?: string;
  categories?: Category[];
}

interface Audience {
  id?: string;
  _id?: string;
  title?: string;
  icon?: string;
  streams?: Stream[];
}

interface Division {
  id?: string;
  _id?: string;
  title?: string;
  description?: string;
  audiences?: Audience[];
}

const getRecordId = (record: { id?: string; _id?: string }) =>
  record.id || record._id || "";

const MAX_IMPORT_ROWS = 500;
const MAX_IMPORT_BYTES = 1024 * 1024;

interface DivisionImportSession {
  fileName: string;
  importId: string;
  payload: CategoryImportPayload;
  preview: CategoryImportPreview;
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

export default function DivisionManager() {
  const { divisionId } = useParams();
  const navigate = useNavigate();
  const [division, setDivision] = useState<Division | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deleting, setDeleting] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewingImport, setIsPreviewingImport] = useState(false);
  const [isCommittingImport, setIsCommittingImport] = useState(false);
  const [workbookError, setWorkbookError] = useState("");
  const [workbookNotice, setWorkbookNotice] = useState("");
  const [workbookSession, setWorkbookSession] =
    useState<DivisionImportSession | null>(null);
  const [workbookCommitResult, setWorkbookCommitResult] =
    useState<CategoryImportCommitResult | null>(null);
  const workbookInputRef = useRef<HTMLInputElement>(null);
  const workbookCommitInProgressRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const loadDivision = async () => {
      if (!divisionId) {
        setError("Division ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const data = (await getDivisionById(divisionId)) as Division | null;
        if (!cancelled) {
          setDivision(data);
          if (!data) setError("Division not found.");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load division."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDivision();
    return () => {
      cancelled = true;
    };
  }, [divisionId]);

  const refreshDivision = async () => {
    if (!divisionId) throw new Error("Division ID is missing.");
    const data = (await getDivisionById(divisionId)) as Division | null;
    setDivision(data);
    if (!data) throw new Error("Division not found after refreshing.");
  };

  const handleDivisionWorkbookExport = async () => {
    if (!division || !divisionId) return;

    setIsExporting(true);
    setWorkbookError("");
    setWorkbookNotice("");
    try {
      const selectedDivisionId = getRecordId(division);
      if (
        !selectedDivisionId ||
        selectedDivisionId.toLowerCase() !== divisionId.toLowerCase()
      ) {
        throw new Error("The selected division ID could not be verified.");
      }
      const categoryRows: string[][] = [];

      (Array.isArray(division.audiences) ? division.audiences : []).forEach(
        (audience) => {
          const audienceId = getRecordId(audience);
          (Array.isArray(audience.streams) ? audience.streams : []).forEach(
            (stream) => {
              const streamId = getRecordId(stream);
              (Array.isArray(stream.categories) ? stream.categories : []).forEach(
                (category) => {
                  const categoryValues = [
                    selectedDivisionId,
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

      const worksheet = XLSX.utils.aoa_to_sheet([
        [...CATEGORY_IMPORT_COLUMNS],
        ...categoryRows,
      ]);
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
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
      XLSX.writeFile(workbook, "Abvolt-Categories.xlsx", { bookType: "xlsx" });
    } catch (exportError) {
      setWorkbookError(
        exportError instanceof Error
          ? exportError.message
          : "Failed to export this division."
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleDivisionWorkbookFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !divisionId) return;

    setWorkbookSession(null);
    setWorkbookCommitResult(null);
    setWorkbookError("");
    setWorkbookNotice("");

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setWorkbookError("Please select an .xlsx workbook.");
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
      const headers = (worksheetRows[0] || []).map((cell) =>
        cellToText(cell).trim()
      );
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

      const preview = await previewDivisionCategoryImport(divisionId, payload);
      setWorkbookSession({ fileName: file.name, importId, payload, preview });
    } catch (previewError) {
      setWorkbookError(
        previewError instanceof Error
          ? previewError.message
          : "Unable to preview this division import."
      );
    } finally {
      setIsPreviewingImport(false);
    }
  };

  const handleConfirmWorkbookImport = async () => {
    if (
      !divisionId ||
      !workbookSession ||
      !workbookSession.preview.valid ||
      isCommittingImport ||
      workbookCommitInProgressRef.current
    ) {
      return;
    }

    const {
      audiencesCreated = 0,
      streamsCreated = 0,
      categoriesCreated,
      categoriesUpdated,
      itemsCreated,
      itemsUpdated,
    } = workbookSession.preview.summary;
    const confirmed = window.confirm(
      `Create ${audiencesCreated} audience${audiencesCreated === 1 ? "" : "s"}, ${streamsCreated} stream${streamsCreated === 1 ? "" : "s"}, ${categoriesCreated} categor${categoriesCreated === 1 ? "y" : "ies"}, and ${itemsCreated} item${itemsCreated === 1 ? "" : "s"}; update ${workbookSession.preview.summary.audiencesUpdated || 0} audiences, ${workbookSession.preview.summary.streamsUpdated || 0} streams, ${categoriesUpdated} categor${categoriesUpdated === 1 ? "y" : "ies"}, and ${itemsUpdated} item${itemsUpdated === 1 ? "" : "s"}?`
    );
    if (!confirmed) return;

    workbookCommitInProgressRef.current = true;
    setIsCommittingImport(true);
    setWorkbookError("");
    setWorkbookNotice("");
    setWorkbookCommitResult(null);
    try {
      const result = await commitDivisionCategoryImport(
        divisionId,
        workbookSession.payload,
        workbookSession.importId
      );
      setWorkbookCommitResult(result);
      if (!result.committed) {
        setWorkbookError(
          "The workbook was not committed. Review the row errors and preview again."
        );
        return;
      }

      try {
        await refreshDivision();
        setWorkbookNotice("Division import completed and refreshed.");
        setWorkbookSession(null);
      } catch (refreshError) {
        setWorkbookError(
          `Import succeeded, but the hierarchy could not be refreshed: ${
            refreshError instanceof Error
              ? refreshError.message
              : "Unknown refresh error."
          }`
        );
      }
    } catch (commitError) {
      setWorkbookError(
        commitError instanceof Error
          ? commitError.message
          : "Division import failed."
      );
    } finally {
      workbookCommitInProgressRef.current = false;
      setIsCommittingImport(false);
    }
  };

  const confirmDelete = async (
    key: string,
    label: string,
    action: () => Promise<unknown>,
    onSuccess?: () => void
  ) => {
    if (!window.confirm(`Delete ${label}?`)) return;

    setDeleting(key);
    setActionError("");
    try {
      await action();
      if (onSuccess) {
        onSuccess();
        return;
      }

      try {
        await refreshDivision();
      } catch (refreshError) {
        setActionError(
          `${label} was deleted, but the division could not be refreshed: ${
            refreshError instanceof Error
              ? refreshError.message
              : "Unknown refresh error."
          }`
        );
      }
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error
          ? deleteError.message
          : `Failed to delete ${label.toLowerCase()}.`
      );
    } finally {
      setDeleting("");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6 text-gray-700">
        <div className="mx-auto max-w-5xl" role="status">
          Loading division…
        </div>
      </main>
    );
  }

  if (error || !division || !divisionId) {
    return (
      <main className="min-h-screen bg-gray-100 p-6 text-gray-900">
        <div className="mx-auto max-w-5xl space-y-5">
          <Link to="/admin" className="text-sm font-medium text-blue-700 hover:underline">
            ← Back to Admin Dashboard
          </Link>
          <div
            className="rounded border border-red-300 bg-red-50 p-4 text-red-800"
            role="alert"
          >
            {error || "Division not found."}
          </div>
        </div>
      </main>
    );
  }

  const audiences = division.audiences || [];

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <nav aria-label="Breadcrumb">
          <Link
            to="/admin"
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            Admin Dashboard
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-sm text-gray-600">Manage Division</span>
        </nav>

        <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-100 p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold sm:text-3xl">
              {division.title || "Untitled Division"}
            </h1>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
              {division.description || "No division description."}
            </p>
            <p className="mt-3 text-sm text-gray-500">
              {audiences.length} {audiences.length === 1 ? "audience" : "audiences"}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              to={`/admin/division/${divisionId}`}
              className="inline-flex items-center gap-2 rounded border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Edit Division
            </Link>
            <Link
              to={`/admin/division/${divisionId}/audience/new`}
              state={{ returnToDivisionManager: true }}
              className="inline-flex items-center gap-2 rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <Plus size={16} />
              Add Audience
            </Link>
            <button
              type="button"
              disabled={Boolean(deleting)}
              onClick={() =>
                confirmDelete(
                  "division",
                  `division "${division.title || "Untitled Division"}"`,
                  () => deleteDivision(divisionId),
                  () => navigate("/admin")
                )
              }
              className="inline-flex items-center gap-2 rounded border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={16} />
              Delete Division
            </button>
          </div>
        </header>

        <section className="space-y-4 rounded-lg border bg-white p-4 shadow-sm sm:p-5">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <FileSpreadsheet size={19} />
              Division Excel
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Uses the same Categories workbook format as the dashboard export.
              This download contains only this division’s categories and items;
              existing IDs and parent IDs are retained. Empty categories are
              included, and omitted records are never deleted.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDivisionWorkbookExport}
              disabled={isExporting || isPreviewingImport || isCommittingImport}
              className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={16} />
              {isExporting ? "Preparing Excel..." : "Download Excel"}
            </button>
            <input
              ref={workbookInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={handleDivisionWorkbookFile}
            />
            <button
              type="button"
              onClick={() => workbookInputRef.current?.click()}
              disabled={isExporting || isPreviewingImport || isCommittingImport}
              className="inline-flex items-center gap-2 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload size={16} />
              {isPreviewingImport ? "Previewing Excel..." : "Upload Excel"}
            </button>
          </div>

          {workbookError && (
            <div
              className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800"
              role="alert"
            >
              {workbookError}
            </div>
          )}
          {workbookNotice && (
            <div
              className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-800"
              role="status"
            >
              {workbookNotice}
            </div>
          )}
          {isPreviewingImport && (
            <div className="rounded border bg-gray-50 p-3 text-sm text-gray-700" role="status">
              Reading workbook and validating category rows…
            </div>
          )}

          {workbookSession && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <h3 className="font-semibold">Import preview</h3>
                <p className="text-sm text-gray-600">
                  Workbook: {workbookSession.fileName}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  ["Audiences", workbookSession.preview.summary.audiencesCreated || 0, workbookSession.preview.summary.audiencesUpdated || 0],
                  ["Streams", workbookSession.preview.summary.streamsCreated || 0, workbookSession.preview.summary.streamsUpdated || 0],
                  ["Categories", workbookSession.preview.summary.categoriesCreated, workbookSession.preview.summary.categoriesUpdated],
                  ["Items", workbookSession.preview.summary.itemsCreated, workbookSession.preview.summary.itemsUpdated],
                ].map(([label, created, updated]) => (
                  <div key={String(label)} className="rounded border bg-gray-50 p-3 text-sm">
                    <p className="font-medium">{label}</p>
                    <p className="mt-1 text-gray-600">
                      {created} to add · {updated} to update
                    </p>
                  </div>
                ))}
                <div className="rounded border bg-gray-50 p-3 text-sm">
                  <p className="font-medium">Invalid rows</p>
                  <p className="mt-1 text-gray-600">
                    {workbookSession.preview.summary.invalid}
                  </p>
                </div>
              </div>

              {workbookSession.preview.rows.some((row) => row.errors.length > 0) && (
                <div className="max-h-64 space-y-2 overflow-y-auto rounded border border-red-200 bg-red-50 p-3">
                  {workbookSession.preview.rows
                    .filter((row) => row.errors.length > 0)
                    .map((row) => (
                      <p
                        key={row.rowNumber}
                        className="text-sm text-red-800"
                      >
                        <strong>Excel row {row.rowNumber}:</strong>{" "}
                        {row.errors.join("; ")}
                      </p>
                    ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleConfirmWorkbookImport}
                  disabled={
                    !workbookSession.preview.valid ||
                    isCommittingImport ||
                    Boolean(workbookCommitResult?.committed)
                  }
                  className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCommittingImport ? "Importing..." : "Confirm Import"}
                </button>
                {!workbookSession.preview.valid && (
                  <span className="text-sm text-red-700">
                    Resolve all validation errors before confirming.
                  </span>
                )}
              </div>
            </div>
          )}
        </section>

        {actionError && (
          <div
            className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800"
            role="alert"
          >
            {actionError}
          </div>
        )}

        <section className="space-y-3" aria-labelledby="hierarchy-heading">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="hierarchy-heading" className="text-xl font-semibold">
              Division hierarchy
            </h2>
            <span className="text-sm text-gray-500">
              Expand a section to manage its contents
            </span>
          </div>

          {audiences.length === 0 ? (
            <div className="rounded-lg border bg-white p-6 text-center text-sm text-gray-600">
              No audiences yet. Add an audience to start building this division.
            </div>
          ) : (
            <div className="space-y-2">
              {audiences.map((audience, audienceIndex) => {
                const audienceId = getRecordId(audience);
                const audienceKey = audienceId || `audience-${audienceIndex}`;
                const streams = audience.streams || [];
                const audienceLabel = audience.title || "Untitled Audience";

                return (
                  <details
                    key={audienceKey}
                    className="group/audience rounded-lg border border-slate-200 bg-white shadow-sm"
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                      <ChevronDown
                        size={18}
                        className="shrink-0 text-gray-500 transition group-open/audience:rotate-180"
                      />
                      <span className="min-w-0 flex-1 truncate font-semibold">
                        {audienceLabel}
                      </span>
                      <span className="hidden text-xs text-gray-500 sm:inline">
                        {streams.length} {streams.length === 1 ? "stream" : "streams"}
                      </span>
                      <span
                        className="flex shrink-0 gap-1"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {audienceId && (
                          <Link
                            to={`/admin/division/${divisionId}/audience/${audienceId}`}
                            state={{ returnToDivisionManager: true }}
                            className="rounded border px-2 py-1 text-xs font-medium hover:bg-gray-50"
                          >
                            Edit
                          </Link>
                        )}
                        {audienceId && (
                          <button
                            type="button"
                            disabled={Boolean(deleting)}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              void confirmDelete(
                                `audience-${audienceId}`,
                                `audience "${audienceLabel}"`,
                                () => deleteAudience(divisionId, audienceId)
                              );
                            }}
                            className="rounded border border-red-200 px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-50"
                            aria-label={`Delete ${audienceLabel}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </span>
                    </summary>

                    <div className="space-y-2 border-t border-slate-200 bg-slate-50 p-3 sm:p-4">
                      {audienceId && (
                        <div className="flex justify-end">
                          <Link
                            to={`/admin/division/${divisionId}/audience/${audienceId}/stream/new`}
                            state={{ returnToDivisionManager: true }}
                            className="inline-flex items-center gap-1 rounded bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                          >
                            <Plus size={14} />
                            Add Stream
                          </Link>
                        </div>
                      )}
                      {streams.length === 0 ? (
                        <p className="rounded border border-dashed bg-white p-3 text-sm text-gray-500">
                          No streams in this audience.
                        </p>
                      ) : (
                        streams.map((stream, streamIndex) => {
                          const streamId = getRecordId(stream);
                          const streamKey = streamId || `stream-${streamIndex}`;
                          const categories = stream.categories || [];
                          const streamLabel = stream.title || "Untitled Stream";

                          return (
                            <details
                              key={streamKey}
                              className="group/stream rounded border border-blue-200 bg-blue-50"
                            >
                              <summary className="flex cursor-pointer list-none items-center gap-3 bg-blue-100 p-3 hover:bg-blue-200 [&::-webkit-details-marker]:hidden">
                                <ChevronDown
                                  size={16}
                                  className="shrink-0 text-gray-500 transition group-open/stream:rotate-180"
                                />
                                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                  {streamLabel}
                                </span>
                                <span className="hidden text-xs text-gray-500 sm:inline">
                                  {categories.length} {categories.length === 1 ? "category" : "categories"}
                                </span>
                                <span
                                  className="flex shrink-0 gap-1"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  {audienceId && streamId && (
                                    <Link
                                      to={`/admin/division/${divisionId}/audience/${audienceId}/stream/${streamId}`}
                                      state={{ returnToDivisionManager: true }}
                                      className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                                    >
                                      Edit
                                    </Link>
                                  )}
                                  {audienceId && streamId && (
                                    <Link
                                      to={`/admin/division/${divisionId}/audience/${audienceId}/stream/${streamId}/category/new`}
                                      state={{ returnToDivisionManager: true }}
                                      className="rounded border px-2 py-1 hover:bg-gray-50"
                                      aria-label={`Add category to ${streamLabel}`}
                                    >
                                      <Plus size={14} />
                                    </Link>
                                  )}
                                  {audienceId && streamId && (
                                    <button
                                      type="button"
                                      disabled={Boolean(deleting)}
                                      onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        void confirmDelete(
                                          `stream-${streamId}`,
                                          `stream "${streamLabel}"`,
                                          () =>
                                            deleteStream(
                                              divisionId,
                                              audienceId,
                                              streamId
                                            )
                                        );
                                      }}
                                      className="rounded border border-red-200 px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-50"
                                      aria-label={`Delete ${streamLabel}`}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </span>
                              </summary>

                              <div className="space-y-2 border-t border-blue-200 bg-blue-50 p-3">
                                {audienceId && streamId && (
                                  <div className="flex justify-end">
                                    <Link
                                      to={`/admin/division/${divisionId}/audience/${audienceId}/stream/${streamId}/category/new`}
                                      state={{ returnToDivisionManager: true }}
                                      className="inline-flex items-center gap-1 rounded bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                                    >
                                      <Plus size={14} />
                                      Add Category
                                    </Link>
                                  </div>
                                )}
                                {categories.length === 0 ? (
                                  <p className="rounded border border-dashed bg-white p-3 text-sm text-gray-500">
                                    No categories in this stream.
                                  </p>
                                ) : (
                                  categories.map((category, categoryIndex) => {
                                    const categoryId = getRecordId(category);
                                    const categoryKey =
                                      categoryId || `category-${categoryIndex}`;
                                    const items = category.items || [];
                                    const categoryLabel =
                                      category.title || "Untitled Category";

                                    return (
                                      <details
                                        key={categoryKey}
                                        className="group/category rounded border border-green-200 bg-green-50"
                                      >
                                        <summary className="flex cursor-pointer list-none items-center gap-3 bg-green-100 p-3 hover:bg-green-200 [&::-webkit-details-marker]:hidden">
                                          <ChevronDown
                                            size={15}
                                            className="shrink-0 text-gray-500 transition group-open/category:rotate-180"
                                          />
                                          <span className="min-w-0 flex-1 truncate text-sm">
                                            {categoryLabel}
                                          </span>
                                          <span className="hidden text-xs text-gray-500 sm:inline">
                                            {items.length} {items.length === 1 ? "item" : "items"}
                                          </span>
                                          <span
                                            className="flex shrink-0 gap-1"
                                            onClick={(event) => event.stopPropagation()}
                                          >
                                            {audienceId && streamId && categoryId && (
                                              <Link
                                                to={`/admin/division/${divisionId}/audience/${audienceId}/stream/${streamId}/category/${categoryId}`}
                                                state={{ returnToDivisionManager: true }}
                                                className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                                              >
                                                Edit
                                              </Link>
                                            )}
                                            {audienceId && streamId && categoryId && (
                                              <Link
                                                to={`/admin/division/${divisionId}/audience/${audienceId}/stream/${streamId}/category/${categoryId}/item/new`}
                                                state={{ returnToDivisionManager: true }}
                                                className="rounded border px-2 py-1 hover:bg-gray-50"
                                                aria-label={`Add item to ${categoryLabel}`}
                                              >
                                                <Plus size={14} />
                                              </Link>
                                            )}
                                            {audienceId && streamId && categoryId && (
                                              <button
                                                type="button"
                                                disabled={Boolean(deleting)}
                                                onClick={(event) => {
                                                  event.preventDefault();
                                                  event.stopPropagation();
                                                  void confirmDelete(
                                                    `category-${categoryId}`,
                                                    `category "${categoryLabel}"`,
                                                    () =>
                                                      deleteCategory(
                                                        divisionId,
                                                        audienceId,
                                                        streamId,
                                                        categoryId
                                                      )
                                                  );
                                                }}
                                                className="rounded border border-red-200 px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-50"
                                                aria-label={`Delete ${categoryLabel}`}
                                              >
                                                <Trash2 size={14} />
                                              </button>
                                            )}
                                          </span>
                                        </summary>

                                        <div className="space-y-1 border-t border-green-200 bg-green-50 p-3">
                                          {items.length === 0 ? (
                                            <p className="rounded border border-dashed bg-white p-3 text-sm text-gray-500">
                                              No items in this category.
                                            </p>
                                          ) : (
                                            items.map((item, itemIndex) => {
                                              const itemId = getRecordId(item);
                                              const itemLabel =
                                                item.title || "Untitled Item";
                                              return (
                                                <div
                                                  key={itemId || `item-${itemIndex}`}
                                                  className="flex flex-wrap items-center gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2"
                                                >
                                                  <span className="min-w-0 flex-1 truncate text-sm">
                                                    {itemLabel}
                                                  </span>
                                                  {audienceId &&
                                                    streamId &&
                                                    categoryId &&
                                                    itemId && (
                                                      <>
                                                        <Link
                                                          to={`/admin/division/${divisionId}/audience/${audienceId}/stream/${streamId}/category/${categoryId}/item/${itemId}/detail`}
                                                          state={{ returnToDivisionManager: true }}
                                                          className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-gray-50"
                                                        >
                                                          View
                                                          <ExternalLink size={12} />
                                                        </Link>
                                                        <Link
                                                          to={`/admin/division/${divisionId}/audience/${audienceId}/stream/${streamId}/category/${categoryId}/item/${itemId}`}
                                                          state={{ returnToDivisionManager: true }}
                                                          className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                                                        >
                                                          Edit
                                                        </Link>
                                                        <button
                                                          type="button"
                                                          disabled={Boolean(deleting)}
                                                          onClick={() =>
                                                            void confirmDelete(
                                                              `item-${itemId}`,
                                                              `item "${itemLabel}"`,
                                                              () =>
                                                                deleteItem(
                                                                  divisionId,
                                                                  audienceId,
                                                                  streamId,
                                                                  categoryId,
                                                                  itemId
                                                                )
                                                            )
                                                          }
                                                          className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                                                        >
                                                          <Trash2 size={13} />
                                                          Delete
                                                        </button>
                                                      </>
                                                    )}
                                                </div>
                                              );
                                            })
                                          )}
                                        </div>
                                      </details>
                                    );
                                  })
                                )}
                              </div>
                            </details>
                          );
                        })
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
