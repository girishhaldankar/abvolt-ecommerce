import app, { connectDB } from "../backend/server";

export default async function handler(req: any, res: any) {
  try {
    await connectDB();

    // Let Express handle request manually (NO serverless-http)
    return app(req, res);
  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ error: "Server Error" });
  }
}