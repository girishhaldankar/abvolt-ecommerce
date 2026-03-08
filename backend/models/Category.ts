import { Schema } from "mongoose";
import { itemSchema } from "./Item";

export const categorySchema = new Schema({
  title: { type: String, required: true },
   description: { type: String }, // 👈 ADD THIS
  icon: String,
  items: [itemSchema],
});
