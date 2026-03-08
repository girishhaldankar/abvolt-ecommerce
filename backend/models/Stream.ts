import { Schema } from "mongoose";
import { categorySchema } from "./Category";

export const streamSchema = new Schema({
  title: { type: String, required: true },
  icon: String,
  categories: [categorySchema],
});
