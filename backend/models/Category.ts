
import { Schema } from "mongoose";
import { itemSchema } from "./Item";

export const categorySchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  icon: String,

  // Cloudinary URL for the category hero image
  image: { type: String, default: "" },

  // Keep all existing product data
  items: [itemSchema],
});
