const assert = require("node:assert/strict");
const test = require("node:test");
const { Types } = require("mongoose");
const { Division } = require("../dist/models/Division");
const { QuoteEnquiry } = require("../dist/models/QuoteEnquiry");
const {
  createQuoteEnquiry,
  QuoteEnquiryError,
  updateQuoteEnquiryStatus,
} = require("../dist/services/quoteEnquiryService");

const validShopPayload = {
  itemSource: "shop",
  itemId: "1",
  customerName: "  Customer Name  ",
  phone: "+91 98765 43210",
  quantity: 3,
  requirements: "Needs delivery information",
};

test("creates a shop enquiry using server-side product details", async (t) => {
  const originalCreate = QuoteEnquiry.create;
  let savedPayload;
  QuoteEnquiry.create = async (payload) => {
    savedPayload = payload;
    return {
      _id: new Types.ObjectId(),
      status: "new",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    };
  };
  t.after(() => {
    QuoteEnquiry.create = originalCreate;
  });

  const result = await createQuoteEnquiry({
    ...validShopPayload,
    itemName: "Untrusted product name",
    itemCategory: "Untrusted category",
  });

  assert.equal(savedPayload.customerName, "Customer Name");
  assert.equal(savedPayload.itemName, "Arduino Uno R3 Development Board");
  assert.equal(savedPayload.itemCategory, "Development Boards");
  assert.equal(result.status, "new");
});

test("rejects invalid quote fields before persistence", async (t) => {
  const originalCreate = QuoteEnquiry.create;
  let createCalled = false;
  QuoteEnquiry.create = async () => {
    createCalled = true;
    throw new Error("Should not be called");
  };
  t.after(() => {
    QuoteEnquiry.create = originalCreate;
  });

  await assert.rejects(
    createQuoteEnquiry({ ...validShopPayload, customerName: " " }),
    (error) => error instanceof QuoteEnquiryError && error.statusCode === 400
  );
  await assert.rejects(
    createQuoteEnquiry({ ...validShopPayload, phone: "12" }),
    (error) => error instanceof QuoteEnquiryError && error.statusCode === 400
  );
  await assert.rejects(
    createQuoteEnquiry({ ...validShopPayload, quantity: 1.5 }),
    (error) => error instanceof QuoteEnquiryError && error.statusCode === 400
  );
  await assert.rejects(
    createQuoteEnquiry({ ...validShopPayload, quantity: 100001 }),
    (error) => error instanceof QuoteEnquiryError && error.statusCode === 400
  );
  await assert.rejects(
    createQuoteEnquiry({ ...validShopPayload, requirements: "x".repeat(2001) }),
    (error) => error instanceof QuoteEnquiryError && error.statusCode === 400
  );
  assert.equal(createCalled, false);
});

test("resolves division catalogue item snapshots from Mongo-backed data", async (t) => {
  const originalFindById = Division.findById;
  const ids = {
    division: new Types.ObjectId().toString(),
    audience: new Types.ObjectId().toString(),
    stream: new Types.ObjectId().toString(),
    category: new Types.ObjectId().toString(),
    item: new Types.ObjectId().toString(),
  };
  Division.findById = () => ({
    lean: async () => ({
      audiences: [
        {
          _id: ids.audience,
          streams: [
            {
              _id: ids.stream,
              categories: [
                {
                  _id: ids.category,
                  title: "Test Category",
                  items: [
                    {
                      _id: ids.item,
                      title: "Trusted Item",
                      code: "ITEM-1",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
  });
  const originalCreate = QuoteEnquiry.create;
  let savedPayload;
  QuoteEnquiry.create = async (payload) => {
    savedPayload = payload;
    return { _id: new Types.ObjectId(), status: "new", createdAt: new Date() };
  };
  t.after(() => {
    Division.findById = originalFindById;
    QuoteEnquiry.create = originalCreate;
  });

  await createQuoteEnquiry({
    ...validShopPayload,
    itemSource: "division",
    itemId: ids.item,
    divisionId: ids.division,
    audienceId: ids.audience,
    streamId: ids.stream,
    categoryId: ids.category,
    itemName: "Untrusted name",
  });

  assert.equal(savedPayload.itemName, "Trusted Item");
  assert.equal(savedPayload.itemCode, "ITEM-1");
  assert.equal(savedPayload.itemCategory, "Test Category");
});

test("rejects nonexistent shop product IDs and invalid status updates", async () => {
  await assert.rejects(
    createQuoteEnquiry({ ...validShopPayload, itemId: "999" }),
    (error) => error instanceof QuoteEnquiryError && error.statusCode === 404
  );
  await assert.rejects(
    updateQuoteEnquiryStatus(new Types.ObjectId().toString(), "unexpected"),
    (error) => error instanceof QuoteEnquiryError && error.statusCode === 400
  );
});
