import { Schema } from "mongoose";

export const itemSchema = new Schema({
  title: { type: String, required: true },
  code: String,                   // Optional code
  shortDescription: String,       // For grid / card preview
  fullDescription: String,        // Detailed item page
  features: [String],             // Features array
  image: String,                  // Image URL
  icon: String,                   // Emoji or icon
  price: Number,                  // Optional
  path: String,                   // Optional path
});
