import { Schema } from "mongoose";
import { streamSchema } from "./Stream";

export const audienceSchema = new Schema({
  title: { type: String, required: true },
  icon: String,
  streams: [streamSchema],
});
