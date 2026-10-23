const assert = require("node:assert/strict");
const test = require("node:test");
const { Types } = require("mongoose");
const { Division } = require("../dist/models/Division");
const {
  CATEGORY_IMPORT_COLUMNS,
  commitDivisionCategoryImport,
  previewCategoryImport,
  previewDivisionCategoryImport,
} = require("../dist/services/categoryImportService");

const newId = () => new Types.ObjectId().toString();

function importRow(fields = {}) {
  return Object.fromEntries(
    CATEGORY_IMPORT_COLUMNS.map((column) => [column, fields[column] || ""])
  );
}

function createDivision() {
  const ids = {
    division: newId(),
    audience: newId(),
    stream: newId(),
    category: newId(),
    item: newId(),
    otherDivision: newId(),
    otherAudience: newId(),
    otherStream: newId(),
  };
  const division = new Division({
    _id: ids.division,
    title: "Selected Division",
    audiences: [
      {
        _id: ids.audience,
        title: "Existing Audience",
        streams: [
          {
            _id: ids.stream,
            title: "Existing Stream",
            categories: [
              {
                _id: ids.category,
                title: "Existing Category",
                items: [{ _id: ids.item, title: "Existing Item", price: 1 }],
              },
            ],
          },
        ],
      },
    ],
  });
  return {
    division,
    ids,
    saveCount: 0,
  };
}

async function withDivision(testContext, fixture, callback) {
  const originalFind = Division.find;
  const filters = [];
  Division.find = (filter) => {
    filters.push(filter);
    return {
      select: async () => {
        const division = new Division(fixture.division.toObject());
        division.save = async () => {
          fixture.saveCount += 1;
          fixture.division = division;
        };
        return [division];
      },
    };
  };
  testContext.after(() => {
    Division.find = originalFind;
  });
  await callback(filters);
}

function rowFor(fixture, fields = {}) {
  return importRow({
    divisionId: fixture.ids.division,
    divisionTitle: "Selected Division",
    audienceId: fixture.ids.audience,
    audienceTitle: "Existing Audience",
    streamId: fixture.ids.stream,
    streamTitle: "Existing Stream",
    ...fields,
  });
}

test("creates a new audience and stream with a category under the selected division", async (t) => {
  const fixture = createDivision();
  await withDivision(t, fixture, async () => {
    const row = rowFor(fixture, {
      audienceId: "",
      audienceTitle: "New Audience",
      streamId: "",
      streamTitle: "New Stream",
      categoryId: "",
      title: "New Category",
    });
    const preview = await previewDivisionCategoryImport(
      fixture.ids.division,
      CATEGORY_IMPORT_COLUMNS,
      [row]
    );

    assert.equal(preview.valid, true, JSON.stringify(preview.rows));
    assert.equal(preview.summary.audiencesCreated, 1);
    assert.equal(preview.summary.streamsCreated, 1);
    assert.equal(preview.summary.categoriesCreated, 1);

    const result = await commitDivisionCategoryImport(
      fixture.ids.division,
      CATEGORY_IMPORT_COLUMNS,
      [row],
      "e9bf9ad1-fda1-4b9d-8a62-868c5e140cc8"
    );
    assert.equal(result.committed, true);
    const audience = fixture.division.audiences.find(
      (entry) => entry.title === "New Audience"
    );
    assert.ok(audience);
    assert.equal(audience.streams[0].title, "New Stream");
    assert.equal(audience.streams[0].categories[0].title, "New Category");
    assert.equal(fixture.saveCount, 1);
  });
});

test("creates a stream under an existing audience", async (t) => {
  const fixture = createDivision();
  await withDivision(t, fixture, async () => {
    const row = rowFor(fixture, {
      streamId: "",
      streamTitle: "New Stream",
      categoryId: "",
      title: "New Category",
    });
    const preview = await previewDivisionCategoryImport(
      fixture.ids.division,
      CATEGORY_IMPORT_COLUMNS,
      [row]
    );
    assert.equal(preview.valid, true, JSON.stringify(preview.rows));
    assert.equal(preview.summary.audiencesUpdated, 1);
    assert.equal(preview.summary.streamsCreated, 1);

    const result = await commitDivisionCategoryImport(
      fixture.ids.division,
      CATEGORY_IMPORT_COLUMNS,
      [row],
      "57293bc3-f58a-4535-b9cf-f615c8e01d95"
    );
    assert.equal(result.committed, true);
    const audience = fixture.division.audiences.id(fixture.ids.audience);
    assert.equal(audience.streams.find((entry) => entry.title === "New Stream").categories[0].title, "New Category");
  });
});

test("creates an empty audience and stream hierarchy row", async (t) => {
  const fixture = createDivision();
  await withDivision(t, fixture, async () => {
    const row = rowFor(fixture, {
      audienceId: "",
      audienceTitle: "Empty Audience",
      streamId: "",
      streamTitle: "Empty Stream",
      categoryId: "",
      title: "",
    });
    const preview = await previewDivisionCategoryImport(
      fixture.ids.division,
      CATEGORY_IMPORT_COLUMNS,
      [row]
    );
    assert.equal(preview.valid, true, JSON.stringify(preview.rows));
    assert.equal(preview.summary.audiencesCreated, 1);
    assert.equal(preview.summary.streamsCreated, 1);
    assert.equal(preview.summary.categoriesCreated, 0);

    const result = await commitDivisionCategoryImport(
      fixture.ids.division,
      CATEGORY_IMPORT_COLUMNS,
      [row],
      "95b42993-a83a-4db4-8677-94ad0ec0d45f"
    );
    assert.equal(result.committed, true);
    const audience = fixture.division.audiences.find(
      (entry) => entry.title === "Empty Audience"
    );
    assert.equal(audience.streams[0].categories.length, 0);
  });
});

test("recognizes existing records and updates category and item", async (t) => {
  const fixture = createDivision();
  await withDivision(t, fixture, async () => {
    const row = rowFor(fixture, {
      categoryId: fixture.ids.category,
      title: "Existing Category",
      itemId: fixture.ids.item,
      itemTitle: "Updated Item",
      itemPrice: "8.25",
    });
    const preview = await previewDivisionCategoryImport(
      fixture.ids.division,
      CATEGORY_IMPORT_COLUMNS,
      [row]
    );
    assert.equal(preview.valid, true, JSON.stringify(preview.rows));
    assert.equal(preview.summary.audiencesUpdated, 1);
    assert.equal(preview.summary.streamsUpdated, 1);
    assert.equal(preview.summary.categoriesUpdated, 1);
    assert.equal(preview.summary.itemsUpdated, 1);

    const result = await commitDivisionCategoryImport(
      fixture.ids.division,
      CATEGORY_IMPORT_COLUMNS,
      [row],
      "7eb0ca90-f1cb-4adb-9004-92d9f17c3c23"
    );
    assert.equal(result.committed, true);
    const item = fixture.division.audiences.id(fixture.ids.audience)
      .streams.id(fixture.ids.stream)
      .categories.id(fixture.ids.category)
      .items.id(fixture.ids.item);
    assert.equal(item.title, "Updated Item");
    assert.equal(item.price, 8.25);
  });
});

test("rejects invalid IDs and ambiguous parent names", async (t) => {
  const fixture = createDivision();
  await withDivision(t, fixture, async () => {
    const invalidId = rowFor(fixture, { audienceId: "bad-id" });
    const invalidIdPreview = await previewDivisionCategoryImport(
      fixture.ids.division,
      CATEGORY_IMPORT_COLUMNS,
      [invalidId]
    );
    assert.equal(invalidIdPreview.valid, false);
    assert.ok(invalidIdPreview.rows[0].errors.some((error) => error.includes("audienceId must be a 24-character MongoDB ID")));

    const invalidStreamParent = rowFor(fixture, {
      streamId: fixture.ids.otherStream,
      categoryId: "",
      title: "Invalid Parent Category",
    });
    const invalidParentPreview = await previewDivisionCategoryImport(
      fixture.ids.division,
      CATEGORY_IMPORT_COLUMNS,
      [invalidStreamParent]
    );
    assert.equal(invalidParentPreview.valid, false);
    assert.ok(invalidParentPreview.rows[0].errors.some((error) => error.includes("streamId does not belong to the specified Audience")));

    fixture.division.audiences.push({
      title: "Existing Audience",
      streams: [],
    });
    const ambiguousName = rowFor(fixture, {
      audienceId: "",
      streamId: "",
    });
    const ambiguousPreview = await previewDivisionCategoryImport(
      fixture.ids.division,
      CATEGORY_IMPORT_COLUMNS,
      [ambiguousName]
    );
    assert.equal(ambiguousPreview.valid, false);
    assert.ok(ambiguousPreview.rows[0].errors.some((error) => error.includes("is ambiguous")));
  });
});

test("rejects cross-division rows without saving outside the selected division", async (t) => {
  const fixture = createDivision();
  await withDivision(t, fixture, async (filters) => {
    const foreignRow = rowFor(fixture, {
      divisionId: fixture.ids.otherDivision,
      audienceId: "",
      audienceTitle: "Foreign Audience",
      streamId: "",
      streamTitle: "Foreign Stream",
      categoryId: "",
      title: "Foreign Category",
    });
    const preview = await previewDivisionCategoryImport(
      fixture.ids.division,
      CATEGORY_IMPORT_COLUMNS,
      [foreignRow]
    );
    assert.equal(preview.valid, false);
    assert.ok(preview.rows[0].errors.some((error) => error.includes("divisionId must match")));
    assert.ok(filters.every((filter) => filter._id.$in.length === 1 && filter._id.$in[0] === fixture.ids.division));

    const result = await commitDivisionCategoryImport(
      fixture.ids.division,
      CATEGORY_IMPORT_COLUMNS,
      [foreignRow],
      "9fbeaf67-94fa-427c-b740-12644b54fe18"
    );
    assert.equal(result.committed, false);
    assert.equal(fixture.saveCount, 0);
    assert.equal(fixture.division.audiences.length, 1);
  });
});

test("global importer still requires existing audience and stream IDs", async (t) => {
  const fixture = createDivision();
  await withDivision(t, fixture, async () => {
    const row = rowFor(fixture, {
      audienceId: "",
      streamId: "",
      categoryId: "",
      title: "New Category",
    });
    const preview = await previewCategoryImport(CATEGORY_IMPORT_COLUMNS, [row]);
    assert.equal(preview.valid, false);
    assert.ok(preview.rows[0].errors.some((error) => error.includes("audienceId must be a 24-character MongoDB ID")));
    assert.ok(preview.rows[0].errors.some((error) => error.includes("streamId must be a 24-character MongoDB ID")));
  });
});
