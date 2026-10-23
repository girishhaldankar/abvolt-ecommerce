import { createHash } from "crypto";
import { Types } from "mongoose";
import { Division } from "../models/Division";

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

const MAX_IMPORT_ROWS = 500;
const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ImportColumn = (typeof CATEGORY_IMPORT_COLUMNS)[number];
type ItemField =
  | "title"
  | "code"
  | "shortDescription"
  | "fullDescription"
  | "features"
  | "image"
  | "icon"
  | "price"
  | "path";
type ImportRow = Record<ImportColumn, string> & {
  rowNumber: number;
  errors: string[];
  categoryAction?: "create" | "update" | "already-imported";
  itemAction?: "create" | "update" | "already-imported";
  categoryGroupKey?: string;
  categoryImportKey?: string;
  categoryImportHash?: string;
  itemImportKey?: string;
  itemImportHash?: string;
  itemValues?: Partial<Record<ItemField, string | string[] | number>>;
};
type CategoryGroup = {
  key: string;
  rows: ImportRow[];
  categoryId: string;
  divisionId: string;
  audienceId: string;
  streamId: string;
  values: Partial<Record<"title" | "description" | "icon" | "image", string>>;
  categoryAction?: "create" | "update" | "already-imported";
  importKey?: string;
  importHash?: string;
};

export class CategoryImportError extends Error {
  constructor(
    readonly statusCode: number,
    message: string
  ) {
    super(message);
  }
}

const CATEGORY_COLUMN_TO_FIELD = {
  title: "title",
  description: "description",
  icon: "icon",
  image: "image",
} as const;

const ITEM_COLUMN_TO_FIELD: Record<string, ItemField> = {
  itemTitle: "title",
  itemCode: "code",
  itemShortDescription: "shortDescription",
  itemFullDescription: "fullDescription",
  itemFeatures: "features",
  itemImage: "image",
  itemIcon: "icon",
  itemPrice: "price",
  itemPath: "path",
};

const FIELD_LIMITS: Record<ImportColumn, number> = {
  divisionId: 24,
  divisionTitle: 200,
  audienceId: 24,
  audienceTitle: 200,
  streamId: 24,
  streamTitle: 200,
  categoryId: 24,
  title: 200,
  description: 5000,
  icon: 100,
  image: 2048,
  itemId: 24,
  itemTitle: 200,
  itemCode: 200,
  itemShortDescription: 1000,
  itemFullDescription: 10000,
  itemFeatures: 5000,
  itemImage: 2048,
  itemIcon: 100,
  itemPrice: 32,
  itemPath: 2048,
};

function validateRequest(columns: unknown, rows: unknown): ImportRow[] {
  if (
    !Array.isArray(columns) ||
    columns.length !== CATEGORY_IMPORT_COLUMNS.length ||
    !CATEGORY_IMPORT_COLUMNS.every((column, index) => columns[index] === column)
  ) {
    throw new CategoryImportError(
      400,
      `Worksheet columns must exactly match: ${CATEGORY_IMPORT_COLUMNS.join(", ")}`
    );
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new CategoryImportError(400, "At least one category row is required");
  }
  if (rows.length > MAX_IMPORT_ROWS) {
    throw new CategoryImportError(
      413,
      `A maximum of ${MAX_IMPORT_ROWS} rows may be imported at once`
    );
  }

  const allowedKeys = new Set<string>(CATEGORY_IMPORT_COLUMNS);
  return rows.map((value, index) => {
    const rowNumber = index + 2;
    const errors: string[] = [];
    const row = {} as Record<ImportColumn, string>;
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      for (const column of CATEGORY_IMPORT_COLUMNS) row[column] = "";
      return { ...row, rowNumber, errors: ["Row must be an object"] };
    }

    const source = value as Record<string, unknown>;
    for (const key of Object.keys(source)) {
      if (!allowedKeys.has(key)) errors.push(`Unexpected column "${key}"`);
    }

    for (const column of CATEGORY_IMPORT_COLUMNS) {
      const raw = source[column];
      if (raw === undefined || raw === null) {
        row[column] = "";
        continue;
      }
      if (typeof raw !== "string") {
        errors.push(`${column} must be text`);
        row[column] = "";
        continue;
      }
      if (raw.length > FIELD_LIMITS[column]) {
        errors.push(`${column} exceeds ${FIELD_LIMITS[column]} characters`);
      }
      row[column] = raw.trim();
    }

    for (const column of ["divisionId", "audienceId", "streamId"] as const) {
      if (!OBJECT_ID_PATTERN.test(row[column])) {
        errors.push(`${column} must be a 24-character MongoDB ID`);
      } else {
        row[column] = row[column].toLowerCase();
      }
    }
    for (const column of [
      "divisionTitle",
      "audienceTitle",
      "streamTitle",
    ] as const) {
      if (!row[column]) errors.push(`${column} is required`);
    }
    for (const column of ["categoryId", "itemId"] as const) {
      if (row[column] && !OBJECT_ID_PATTERN.test(row[column])) {
        errors.push(`${column} must be blank or a valid MongoDB ID`);
      } else if (row[column]) {
        row[column] = row[column].toLowerCase();
      }
    }

    if (row.itemFeatures) {
      try {
        parseFeatureValues(row.itemFeatures);
      } catch (error) {
        errors.push(
          error instanceof Error
            ? error.message
            : "itemFeatures must be newline-separated text or a JSON array of strings"
        );
      }
    }
    if (row.itemPrice) {
      const price = Number(row.itemPrice);
      if (!Number.isFinite(price)) errors.push("itemPrice must be a valid number");
    }

    return { ...row, rowNumber, errors };
  });
}

function getId(value: { _id?: Types.ObjectId } | null | undefined) {
  return value?._id?.toString() || "";
}

function marker(doc: any, name: "key" | "hash") {
  return doc.get(name === "key" ? "_bulkImportKey" : "_bulkImportHash") || "";
}

function makeImportKey(importId: string, firstRowNumber: number) {
  return `${importId}:${firstRowNumber}`;
}

function makeItemImportKey(importId: string, rowNumber: number) {
  return `${importId}:item:${rowNumber}`;
}

function hash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function parseFeatureValues(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[")) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error("itemFeatures contains invalid legacy JSON");
    }

    if (
      !Array.isArray(parsed) ||
      parsed.some((feature) => typeof feature !== "string")
    ) {
      throw new Error("itemFeatures legacy JSON must be an array of strings");
    }

    return parsed.map((feature) => feature.trim()).filter(Boolean);
  }

  return trimmed
    .split(/\r?\n/)
    .map((feature) => feature.trim())
    .filter(Boolean);
}

function parseItemValues(row: ImportRow) {
  const values: Partial<Record<ItemField, string | string[] | number>> = {};
  for (const [column, field] of Object.entries(ITEM_COLUMN_TO_FIELD)) {
    const value = row[column as ImportColumn];
    if (!value) continue;
    if (field === "features") {
      values[field] = parseFeatureValues(value);
    } else if (field === "price") {
      values[field] = Number(value);
    } else {
      values[field] = value;
    }
  }
  return values;
}

function hasMeaningfulItemData(row: ImportRow) {
  return Object.keys(ITEM_COLUMN_TO_FIELD).some(
    (column) => row[column as ImportColumn] !== ""
  );
}

function sameValue(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function assignNonBlank(
  target: { set(path: string, value: unknown): unknown },
  values: object
) {
  for (const [field, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") target.set(field, value);
  }
}

function makeCategoryGroupKey(row: ImportRow) {
  if (row.categoryId) return `existing:${row.categoryId}`;
  return `new:${row.divisionId}:${row.audienceId}:${row.streamId}:${row.title.toLocaleLowerCase()}`;
}

function buildGroups(rows: ImportRow[]) {
  const groups = new Map<string, CategoryGroup>();
  for (const row of rows) {
    if (row.errors.length) continue;
    if (!row.categoryId && !row.title) {
      row.errors.push("title is required for a new category");
      continue;
    }

    const key = makeCategoryGroupKey(row);
    row.categoryGroupKey = key;
    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        rows: [],
        categoryId: row.categoryId,
        divisionId: row.divisionId,
        audienceId: row.audienceId,
        streamId: row.streamId,
        values: {},
      };
      groups.set(key, group);
    }
    group.rows.push(row);

    if (
      group.divisionId !== row.divisionId ||
      group.audienceId !== row.audienceId ||
      group.streamId !== row.streamId
    ) {
      row.errors.push("Rows grouped as one category must have the same parent IDs");
    }

    for (const [column, field] of Object.entries(CATEGORY_COLUMN_TO_FIELD)) {
      const value = row[column as keyof typeof CATEGORY_COLUMN_TO_FIELD];
      if (!value) continue;
      const current = group.values[field];
      if (current !== undefined && current !== value) {
        row.errors.push(`Conflicting category ${field} values in repeated category rows`);
      } else {
        group.values[field] = value;
      }
    }
  }
  return [...groups.values()];
}

function collectMarkers(division: any) {
  const categories = new Map<string, any>();
  const items = new Map<string, { item: any; category: any; audience: any; stream: any }>();
  for (const audience of division.audiences || []) {
    for (const stream of audience.streams || []) {
      for (const category of stream.categories || []) {
        const categoryKey = marker(category, "key");
        if (categoryKey) categories.set(categoryKey, category);
        for (const item of category.items || []) {
          const itemKey = marker(item, "key");
          if (itemKey) items.set(itemKey, { item, category, audience, stream });
        }
      }
    }
  }
  return { categories, items };
}

function publicRows(rows: ImportRow[]) {
  return rows.map((row) => ({
    rowNumber: row.rowNumber,
    categoryAction: row.errors.length ? "invalid" : row.categoryAction,
    itemAction: row.errors.length ? undefined : row.itemAction,
    ...(row.categoryId ? { categoryId: row.categoryId } : {}),
    ...(row.itemId ? { itemId: row.itemId } : {}),
    errors: row.errors,
  }));
}

async function validateRows(columns: unknown, sourceRows: unknown, importId?: string) {
  if (importId !== undefined && !UUID_PATTERN.test(importId)) {
    throw new CategoryImportError(400, "importId must be a UUID");
  }
  const rows = validateRequest(columns, sourceRows);
  const groups = buildGroups(rows);
  const divisionIds = new Set(
    rows.filter((row) => OBJECT_ID_PATTERN.test(row.divisionId)).map((row) => row.divisionId)
  );
  const divisions = await Division.find({
    _id: { $in: [...divisionIds] },
  }).select(
    "+audiences.streams.categories._bulkImportKey +audiences.streams.categories._bulkImportHash +audiences.streams.categories.items._bulkImportKey +audiences.streams.categories.items._bulkImportHash"
  );
  const divisionsById = new Map(divisions.map((division) => [getId(division), division]));
  const markersByDivision = new Map<string, ReturnType<typeof collectMarkers>>();

  const categoryIdsSeen = new Map<string, ImportRow>();
  const itemIdsSeen = new Map<
    string,
    { row: ImportRow; values: Partial<Record<ItemField, string | string[] | number>>; group: CategoryGroup }
  >();
  const duplicateItemRows = new Set<ImportRow>();
  for (const row of rows) {
    if (row.errors.length) continue;
    if (row.categoryId) {
      const prior = categoryIdsSeen.get(row.categoryId);
      if (prior && prior.categoryGroupKey !== row.categoryGroupKey) {
        row.errors.push("categoryId is duplicated with conflicting parent rows");
        prior.errors.push("categoryId is duplicated with conflicting parent rows");
      }
      categoryIdsSeen.set(row.categoryId, prior || row);
    }
    if (row.itemId) {
      const group = groups.find((candidate) => candidate.rows.includes(row));
      if (!group) continue;
      const values = parseItemValues(row);
      const prior = itemIdsSeen.get(row.itemId);
      if (prior) {
        const conflict = prior.group.key !== group.key ||
          Object.entries(values).some(
            ([field, value]) =>
              prior.values[field as ItemField] !== undefined &&
              !sameValue(prior.values[field as ItemField], value)
          );
        if (conflict) {
          row.errors.push("itemId is duplicated with conflicting parent or item data");
          prior.row.errors.push("itemId is duplicated with conflicting parent or item data");
        } else {
          Object.assign(prior.values, values);
          prior.row.itemValues = prior.values;
          duplicateItemRows.add(row);
        }
      } else {
        itemIdsSeen.set(row.itemId, { row, values, group });
      }
    }
  }

  for (const group of groups) {
    const first = group.rows[0];
    if (group.rows.some((row) => row.errors.length)) continue;
    const division = divisionsById.get(group.divisionId);
    if (!division) {
      first.errors.push("Division was not found");
      continue;
    }
    const audience = division.audiences.id(group.audienceId);
    if (!audience) {
      first.errors.push("Audience does not belong to the specified Division");
      continue;
    }
    if (audience.title !== first.audienceTitle) {
      first.errors.push("audienceTitle does not match the specified Audience");
    }
    const stream = audience.streams.id(group.streamId);
    if (!stream) {
      first.errors.push("Stream does not belong to the specified Audience");
      continue;
    }
    for (const row of group.rows) {
      if (division.title !== row.divisionTitle) row.errors.push("divisionTitle does not match the specified Division");
      if (audience.title !== row.audienceTitle) row.errors.push("audienceTitle does not match the specified Audience");
      if (stream.title !== row.streamTitle) row.errors.push("streamTitle does not match the specified Stream");
    }

    let category: any;
    if (group.categoryId) {
      category = stream.categories.id(group.categoryId);
      if (!category) {
        first.errors.push("categoryId does not belong to the specified Stream");
        continue;
      }
      group.categoryAction = "update";
    } else {
      group.categoryAction = "create";
      if (importId) {
        group.importKey = makeImportKey(importId, group.rows[0].rowNumber);
        group.importHash = hash({
          divisionId: group.divisionId,
          audienceId: group.audienceId,
          streamId: group.streamId,
          title: group.values.title || "",
          description: group.values.description || "",
          icon: group.values.icon || "Folder",
          image: group.values.image || "",
        });
        let markers = markersByDivision.get(group.divisionId);
        if (!markers) {
          markers = collectMarkers(division);
          markersByDivision.set(group.divisionId, markers);
        }
        const priorCategory = markers.categories.get(group.importKey);
        if (priorCategory) {
          if (marker(priorCategory, "hash") !== group.importHash) {
            first.errors.push("importId was already used with different category data");
          } else {
            category = priorCategory;
            group.categoryId = getId(priorCategory);
            group.categoryAction = "already-imported";
          }
        }
      }
    }

    for (const row of group.rows) {
      row.categoryAction = group.categoryAction;
      if (duplicateItemRows.has(row)) {
        row.itemAction = undefined;
        continue;
      }
      const itemDataPresent = hasMeaningfulItemData(row);
      if (!row.itemId && !itemDataPresent) {
        row.itemAction = undefined;
        continue;
      }

      const itemValues = row.itemId
        ? itemIdsSeen.get(row.itemId)?.values || parseItemValues(row)
        : parseItemValues(row);
      row.itemValues = itemValues;
      if (row.itemId) {
        if (!category) {
          row.errors.push("Item updates require an existing categoryId");
          continue;
        }
        const item = category.items.id(row.itemId);
        if (!item) {
          row.errors.push("itemId does not belong to the specified Category");
          continue;
        }
        row.itemAction = "update";
        continue;
      }

      if (typeof itemValues.title !== "string" || !itemValues.title.trim()) {
        row.errors.push("itemTitle is required for a new item");
        continue;
      }
      row.itemAction = "create";
      if (importId) {
        row.itemImportKey = makeItemImportKey(importId, row.rowNumber);
        row.itemImportHash = hash({
          categoryGroup: group.key,
          values: itemValues,
        });
        let markers = markersByDivision.get(group.divisionId);
        if (!markers) {
          markers = collectMarkers(division);
          markersByDivision.set(group.divisionId, markers);
        }
        const priorItem = markers.items.get(row.itemImportKey);
        if (priorItem) {
          if (
            marker(priorItem.item, "hash") !== row.itemImportHash ||
            getId(priorItem.category) !== group.categoryId &&
              group.categoryAction !== "create"
          ) {
            row.errors.push("importId was already used with different item data");
          } else {
            row.itemAction = "already-imported";
            row.itemId = getId(priorItem.item);
          }
        }
      }
    }
  }

  const itemCandidates = rows.filter((row) => row.itemAction === "create");
  const proposedItemRows = new Map<string, ImportRow[]>();
  for (const row of itemCandidates) {
    const signature = hash({
      group: row.categoryGroupKey,
      values: row.itemValues,
    });
    const duplicates = proposedItemRows.get(signature) || [];
    duplicates.push(row);
    proposedItemRows.set(signature, duplicates);
  }
  for (const duplicates of proposedItemRows.values()) {
    if (duplicates.length > 1) {
      duplicates.forEach((row) => row.errors.push("Duplicate proposed new-item row"));
    }
  }

  const validGroups = groups.filter((group) =>
    group.rows.every((row) => row.errors.length === 0)
  );
  const summary = {
    total: rows.length,
    categoriesCreated: validGroups.filter((group) => group.categoryAction === "create").length,
    categoriesUpdated: validGroups.filter((group) => group.categoryAction === "update").length,
    categoriesAlreadyImported: validGroups.filter((group) => group.categoryAction === "already-imported").length,
    itemsCreated: rows.filter((row) => row.errors.length === 0 && row.itemAction === "create").length,
    itemsUpdated: rows.filter((row) => row.errors.length === 0 && row.itemAction === "update").length,
    itemsAlreadyImported: rows.filter((row) => row.errors.length === 0 && row.itemAction === "already-imported").length,
    invalid: rows.filter((row) => row.errors.length > 0).length,
  };

  return {
    rows,
    groups,
    divisionsById,
    valid: summary.invalid === 0,
    summary,
  };
}

export async function previewCategoryImport(columns: unknown, rows: unknown) {
  const validation = await validateRows(columns, rows);
  return {
    valid: validation.valid,
    summary: validation.summary,
    rows: publicRows(validation.rows),
  };
}

export async function commitCategoryImport(
  columns: unknown,
  rows: unknown,
  importId: unknown
) {
  if (typeof importId !== "string") {
    throw new CategoryImportError(400, "importId is required");
  }
  const validation = await validateRows(columns, rows, importId);
  if (!validation.valid) {
    return {
      committed: false,
      valid: false,
      summary: validation.summary,
      rows: publicRows(validation.rows),
    };
  }

  const divisionIds = new Set(validation.rows.map((row) => row.divisionId));
  if (divisionIds.size !== 1) {
    throw new CategoryImportError(409, "A commit may target only one Division. Split the import by Division.");
  }
  const division = validation.divisionsById.get(validation.rows[0].divisionId);
  if (!division) throw new CategoryImportError(409, "Division changed before commit; preview again");

  const createdCategoryIds = new Map<string, string>();
  const createdItemIds = new Map<number, string>();

  for (const group of validation.groups) {
    const audience = division.audiences.id(group.audienceId);
    const stream = audience?.streams.id(group.streamId);
    if (!stream) {
      throw new CategoryImportError(409, `Excel row ${group.rows[0].rowNumber}: parent hierarchy changed before commit`);
    }

    let category = group.categoryId ? stream.categories.id(group.categoryId) : undefined;
    if (!category && group.categoryAction === "already-imported" && group.importKey) {
      category = stream.categories.find((candidate: any) => marker(candidate, "key") === group.importKey);
    }
    if (group.categoryAction === "update") {
      if (!category) {
        throw new CategoryImportError(409, `Excel row ${group.rows[0].rowNumber}: category changed before commit`);
      }
      assignNonBlank(category, group.values);
    } else if (group.categoryAction === "create") {
      if (!group.importKey || !group.importHash) {
        throw new CategoryImportError(409, "Category import marker missing; retry preview");
      }
      category = stream.categories.create({
        title: group.values.title,
        description: group.values.description || "",
        icon: group.values.icon || "Folder",
        image: group.values.image || "",
        items: [],
        _bulkImportKey: group.importKey,
        _bulkImportHash: group.importHash,
      });
      stream.categories.push(category);
    }
    if (!category) {
      throw new CategoryImportError(409, `Excel row ${group.rows[0].rowNumber}: category could not be resolved`);
    }
    createdCategoryIds.set(group.key, getId(category));

    const itemRowsById = new Map<string, ImportRow>();
    for (const row of group.rows) {
      if (row.itemId && row.itemAction === "update") {
        const previous = itemRowsById.get(row.itemId);
        if (previous) continue;
        itemRowsById.set(row.itemId, row);
        const item = category.items.id(row.itemId);
        if (!item) {
          throw new CategoryImportError(409, `Excel row ${row.rowNumber}: item changed before commit`);
        }
        assignNonBlank(item, row.itemValues || {});
      } else if (row.itemAction === "create") {
        if (!row.itemImportKey || !row.itemImportHash) {
          throw new CategoryImportError(409, `Excel row ${row.rowNumber}: item import marker missing`);
        }
        const existingItem = category.items.find(
          (candidate: any) => marker(candidate, "key") === row.itemImportKey
        );
        if (existingItem) {
          if (marker(existingItem, "hash") !== row.itemImportHash) {
            throw new CategoryImportError(409, `Excel row ${row.rowNumber}: importId was reused with different item data`);
          }
          row.itemAction = "already-imported";
          row.itemId = getId(existingItem);
          continue;
        }
        const values = row.itemValues || {};
        const item = category.items.create({
          ...values,
          _bulkImportKey: row.itemImportKey,
          _bulkImportHash: row.itemImportHash,
        });
        category.items.push(item);
        createdItemIds.set(row.rowNumber, getId(item));
      }
    }
  }

  try {
    await division.save();
  } catch (error) {
    if (error instanceof Error && error.name === "VersionError") {
      throw new CategoryImportError(409, "Division changed during commit. Retry with the same importId.");
    }
    throw error;
  }

  const responseRows = validation.rows.map((row) => ({
    rowNumber: row.rowNumber,
    categoryAction: row.categoryAction,
    itemAction: row.itemAction,
    ...(createdCategoryIds.get(row.categoryGroupKey || "")
      ? { categoryId: createdCategoryIds.get(row.categoryGroupKey || "") }
      : row.categoryId
        ? { categoryId: row.categoryId }
        : {}),
    ...(createdItemIds.get(row.rowNumber)
      ? { itemId: createdItemIds.get(row.rowNumber) }
      : row.itemId
        ? { itemId: row.itemId }
        : {}),
    errors: [],
  }));
  return {
    committed: true,
    valid: true,
    summary: validation.summary,
    rows: responseRows,
  };
}
