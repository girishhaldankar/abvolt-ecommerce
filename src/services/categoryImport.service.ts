import { ApiError, apiFetch } from "./api";

export const CATEGORY_IMPORT_COLUMNS = [
  "divisionId",
  "divisionTitle",
  "audienceId",
  "audienceTitle",
  "streamId",
  "streamTitle",
  "categoryId",
  "title",
  "description",
  "icon",
  "image",
  "itemId",
  "itemTitle",
  "itemCode",
  "itemShortDescription",
  "itemFullDescription",
  "itemFeatures",
  "itemImage",
  "itemIcon",
  "itemPrice",
  "itemPath",
] as const;

export type CategoryImportRow = Record<
  (typeof CATEGORY_IMPORT_COLUMNS)[number],
  string
>;

export interface CategoryImportSummary {
  total: number;
  categoriesCreated: number;
  categoriesUpdated: number;
  categoriesAlreadyImported: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsAlreadyImported: number;
  invalid: number;
}

export interface CategoryImportRowResult {
  rowNumber: number;
  categoryAction?: "create" | "update" | "already-imported" | "invalid";
  itemAction?: "create" | "update" | "already-imported";
  categoryId?: string;
  itemId?: string;
  errors: string[];
}

export interface CategoryImportPreview {
  valid: boolean;
  summary: CategoryImportSummary;
  rows: CategoryImportRowResult[];
}

export interface CategoryImportCommitResult extends CategoryImportPreview {
  committed: boolean;
}

export interface CategoryImportPayload {
  columns: readonly string[];
  rows: CategoryImportRow[];
}

function isCommitResult(value: unknown): value is CategoryImportCommitResult {
  if (typeof value !== "object" || value === null) return false;
  const result = value as Partial<CategoryImportCommitResult>;
  return (
    typeof result.committed === "boolean" &&
    typeof result.valid === "boolean" &&
    typeof result.summary === "object" &&
    Array.isArray(result.rows)
  );
}

export const previewCategoryImport = (payload: CategoryImportPayload) =>
  apiFetch("/divisions/category-import/preview", {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<CategoryImportPreview>;

export async function commitCategoryImport(
  payload: CategoryImportPayload,
  importId: string
): Promise<CategoryImportCommitResult> {
  try {
    return (await apiFetch("/divisions/category-import/commit", {
      method: "POST",
      body: JSON.stringify({ ...payload, importId }),
    })) as CategoryImportCommitResult;
  } catch (error) {
    if (error instanceof ApiError && isCommitResult(error.data)) {
      return error.data;
    }
    throw error;
  }
}
