import { Schema, model } from "mongoose";

import { audienceSchema } from "./Audience";

const divisionSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  icon: String,
  color: { type: String, default: "bg-gradient-to-br from-indigo-500 to-purple-600" },
  audiences: [audienceSchema],
});

export const Division = model("Division", divisionSchema);
