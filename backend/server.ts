// server.ts
import dns from "dns";
import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import "express-async-errors";

import divisionRoutes from "./routes/divisionRoutes";

// Use Google DNS for MongoDB SRV resolution
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

const app = express();

/* ------------------- MIDDLEWARE ------------------- */
app.use(cors());
app.use(express.json());

/* ------------------- HEALTH CHECK ------------------- */
app.get("/", (_req: Request, res: Response) => {
  res.send("API is running ✅");
});

/* ------------------- ROUTES ------------------- */
app.use("/api/divisions", divisionRoutes);

/* ------------------- GLOBAL ERROR HANDLER ------------------- */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
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

    cached.promise = mongoose
      .connect(MONGO_URI)
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