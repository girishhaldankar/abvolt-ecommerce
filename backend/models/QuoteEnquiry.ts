import { model, Schema } from "mongoose";

export const QUOTE_ENQUIRY_STATUSES = [
  "new",
  "contacted",
  "quoted",
  "closed",
] as const;

const quoteEnquirySchema = new Schema(
  {
    customerName: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 32 },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 100000,
      validate: {
        validator: Number.isSafeInteger,
        message: "Quantity must be a whole number.",
      },
    },
    requirements: { type: String, trim: true, maxlength: 2000, default: "" },
    itemSource: {
      type: String,
      required: true,
      enum: ["division", "shop"],
    },
    itemId: { type: String, required: true, trim: true, maxlength: 64 },
    itemName: { type: String, required: true, trim: true, maxlength: 200 },
    itemCode: { type: String, trim: true, maxlength: 100, default: "" },
    itemCategory: { type: String, trim: true, maxlength: 120, default: "" },
    divisionId: { type: String, trim: true, maxlength: 64 },
    audienceId: { type: String, trim: true, maxlength: 64 },
    streamId: { type: String, trim: true, maxlength: 64 },
    categoryId: { type: String, trim: true, maxlength: 64 },
    status: {
      type: String,
      enum: QUOTE_ENQUIRY_STATUSES,
      default: "new",
      required: true,
    },
    statusUpdatedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true }
);

quoteEnquirySchema.index({ createdAt: -1 });

export const QuoteEnquiry = model("QuoteEnquiry", quoteEnquirySchema);
