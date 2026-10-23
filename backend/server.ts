// server.ts
import dns from "dns";
import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import "express-async-errors";

import divisionRoutes from "./routes/divisionRoutes";

// Use Google DNS for MongoDB SRV resolution
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config({
  path: [
    path.resolve(__dirname, ".env"),
    path.resolve(__dirname, "..", ".env"),
    path.resolve(process.cwd(), "backend", ".env"),
    path.resolve(process.cwd(), ".env"),
  ],
});

const app = express();

/* ------------------- MIDDLEWARE ------------------- */
app.use(cors());
app.use(
  "/api/divisions/category-import",
  express.json({ limit: "1mb" })
);
app.use(express.json());

/* ------------------- HEALTH CHECK ------------------- */
app.get("/", (_req: Request, res: Response) => {
  res.send("API is running ✅");
});

/* ------------------- ROUTES ------------------- */
app.use("/api/divisions", divisionRoutes);

/* ------------------- GLOBAL ERROR HANDLER ------------------- */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ error: "Import request exceeds the 1 MB limit" });
  }
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON request body" });
  }

  console.error("Global Error Handler:", err);
  res.status(err.status || 500).json({ error: err.message || "Server Error" });
});

/* ------------------- MONGO CONNECTION (SERVERLESS-FRIENDLY) ------------------- */
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error("MONGO_URI not found in environment variables");

// Cached connection for Vercel serverless
let cached: {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
} = (globalThis as any)._mongoCached || {
  conn: null,
  promise: null,
};

(globalThis as any)._mongoCached = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    console.log("Connecting to MongoDB...");

    const mongoUri = MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI not found in environment variables");

    cached.promise = mongoose
      .connect(mongoUri)
      .then((mongoose) => {
        console.log("✅ MongoDB connected");
        return mongoose;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Connect immediately for local dev
if (!process.env.VERCEL) {
  connectDB().catch((err) => {
    console.error("❌ Initial MongoDB connection failed:", err);
    process.exit(1);
  });
}

/* ------------------- START SERVER (LOCAL ONLY) ------------------- */
const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

/* ------------------- EXPORT APP FOR VERCEL ------------------- */
export default app;