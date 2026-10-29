import { Response, Router } from "express";
import { requireAdmin } from "../middleware/requireAdmin";
import {
  createQuoteEnquiry,
  getQuoteEnquiryById,
  listQuoteEnquiries,
  QuoteEnquiryError,
  updateQuoteEnquiryStatus,
} from "../services/quoteEnquiryService";
import { connectDB } from "../server";

const router = Router();

function handleQuoteError(
  res: Response,
  error: unknown,
  operation: string
) {
  if (error instanceof QuoteEnquiryError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  console.error(`${operation} failed`);
  return res.status(500).json({ error: "Unable to process quote enquiry." });
}

router.post("/", async (req, res) => {
  try {
    await connectDB();
    const enquiry = await createQuoteEnquiry(req.body);
    return res.status(201).json({ success: true, enquiry });
  } catch (error) {
    return handleQuoteError(res, error, "Quote submission");
  }
});

router.get("/", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const result = await listQuoteEnquiries(
      req.query.page,
      req.query.pageSize,
      req.query.status
    );
    return res.json(result);
  } catch (error) {
    return handleQuoteError(res, error, "Quote enquiry list");
  }
});

router.get("/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const enquiry = await getQuoteEnquiryById(req.params.id);
    return res.json({ enquiry });
  } catch (error) {
    return handleQuoteError(res, error, "Quote enquiry retrieval");
  }
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const enquiry = await updateQuoteEnquiryStatus(
      req.params.id,
      req.body?.status
    );
    return res.json({ enquiry });
  } catch (error) {
    return handleQuoteError(res, error, "Quote enquiry status update");
  }
});

export default router;
