import { Router } from "express";
import {
  createDivision,
  updateDivision,
  deleteDivision,
  getAllDivisions,
  getDivisionById,
  getDivisionsForLanding,
  addAudience,
  updateAudience,
  deleteAudience,
  addStream,
  updateStream,
  deleteStream,
  addCategory,
  updateCategory,
  deleteCategory,
  addItem,
  updateItem,
  deleteItem,
  getCategoryViewData,
  getItemViewData,
} from "../services/divisionService";

import { connectDB } from "../server"; // Import the DB connection function
import { requireAdmin } from "../middleware/requireAdmin";
import {
  CategoryImportError,
  commitCategoryImport,
  previewCategoryImport,
} from "../services/categoryImportService";

const router = Router();

/* =========================================================
   BULK CATEGORY IMPORT
========================================================= */
router.post(
  "/category-import/preview",
  requireAdmin,
  async (req, res) => {
    try {
      await connectDB();
      const result = await previewCategoryImport(
        req.body?.columns,
        req.body?.rows
      );
      res.json(result);
    } catch (error) {
      if (error instanceof CategoryImportError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error("Category import preview failed");
      return res.status(500).json({ error: "Unable to validate category import" });
    }
  }
);

router.post(
  "/category-import/commit",
  requireAdmin,
  async (req, res) => {
    try {
      await connectDB();
      const result = await commitCategoryImport(
        req.body?.columns,
        req.body?.rows,
        req.body?.importId
      );
      res.status(result.committed ? 200 : 422).json(result);
    } catch (error) {
      if (error instanceof CategoryImportError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error("Category import commit failed");
      return res.status(500).json({ error: "Unable to commit category import" });
    }
  }
);

/* =========================================================
   DIVISION ROUTES
========================================================= */
router.get("/landing", async (_, res) => {
  await connectDB();
  const divisions = await getDivisionsForLanding();
  res.json(divisions);
});

router.get("/", async (_, res) => {
  await connectDB();
  const divisions = await getAllDivisions();
  res.json(divisions);
});

router.get("/:divisionId", async (req, res) => {
  await connectDB();
  const division = await getDivisionById(req.params.divisionId);
  if (!division) return res.status(404).json({ error: "Division not found" });
  res.json(division);
});

router.post("/", requireAdmin, async (req, res) => {
  await connectDB();
  try {
    const division = await createDivision(req.body);
    res.json(division);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:divisionId", requireAdmin, async (req, res) => {
  await connectDB();
  try {
    const division = await updateDivision(req.params.divisionId, req.body);
    res.json(division);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:divisionId", requireAdmin, async (req, res) => {
  await connectDB();
  try {
    const result = await deleteDivision(req.params.divisionId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =========================================================
   AUDIENCE ROUTES
========================================================= */
router.post("/:divisionId/audiences", requireAdmin, async (req, res) => {
  await connectDB();
  try {
    const audience = await addAudience(req.params.divisionId, req.body);
    res.json(audience);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:divisionId/audiences/:audienceId", requireAdmin, async (req, res) => {
  await connectDB();
  try {
    const audience = await updateAudience(
      req.params.divisionId,
      req.params.audienceId,
      req.body
    );
    res.json(audience);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:divisionId/audiences/:audienceId", requireAdmin, async (req, res) => {
  await connectDB();
  try {
    const result = await deleteAudience(
      req.params.divisionId,
      req.params.audienceId
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =========================================================
   STREAM ROUTES
========================================================= */
router.post("/:divisionId/audiences/:audienceId/streams", requireAdmin, async (req, res) => {
  await connectDB();
  try {
    const stream = await addStream(
      req.params.divisionId,
      req.params.audienceId,
      req.body
    );
    res.json(stream);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put(
  "/:divisionId/audiences/:audienceId/streams/:streamId",
  requireAdmin,
  async (req, res) => {
    await connectDB();
    try {
      const stream = await updateStream(
        req.params.divisionId,
        req.params.audienceId,
        req.params.streamId,
        req.body
      );
      res.json(stream);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

router.delete(
  "/:divisionId/audiences/:audienceId/streams/:streamId",
  requireAdmin,
  async (req, res) => {
    await connectDB();
    try {
      const result = await deleteStream(
        req.params.divisionId,
        req.params.audienceId,
        req.params.streamId
      );
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* =========================================================
   CATEGORY ROUTES
========================================================= */
router.post(
  "/:divisionId/audiences/:audienceId/streams/:streamId/categories",
  requireAdmin,
  async (req, res) => {
    await connectDB();
    try {
      const category = await addCategory(
        req.params.divisionId,
        req.params.audienceId,
        req.params.streamId,
        req.body
      );
      res.json(category);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

router.put(
  "/:divisionId/audiences/:audienceId/streams/:streamId/categories/:categoryId",
  requireAdmin,
  async (req, res) => {
    await connectDB();
    try {
      const category = await updateCategory(
        req.params.divisionId,
        req.params.audienceId,
        req.params.streamId,
        req.params.categoryId,
        req.body
      );
      res.json(category);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

router.delete(
  "/:divisionId/audiences/:audienceId/streams/:streamId/categories/:categoryId",
  requireAdmin,
  async (req, res) => {
    await connectDB();
    try {
      const result = await deleteCategory(
        req.params.divisionId,
        req.params.audienceId,
        req.params.streamId,
        req.params.categoryId
      );
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* =========================================================
   ITEM ROUTES
========================================================= */
router.post(
  "/:divisionId/audiences/:audienceId/streams/:streamId/categories/:categoryId/items",
  requireAdmin,
  async (req, res) => {
    await connectDB();
    try {
      const item = await addItem(
        req.params.divisionId,
        req.params.audienceId,
        req.params.streamId,
        req.params.categoryId,
        req.body
      );
      res.json(item);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

router.put(
  "/:divisionId/audiences/:audienceId/streams/:streamId/categories/:categoryId/items/:itemId",
  requireAdmin,
  async (req, res) => {
    await connectDB();
    try {
      const item = await updateItem(
        req.params.divisionId,
        req.params.audienceId,
        req.params.streamId,
        req.params.categoryId,
        req.params.itemId,
        req.body
      );
      res.json(item);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

router.delete(
  "/:divisionId/audiences/:audienceId/streams/:streamId/categories/:categoryId/items/:itemId",
  requireAdmin,
  async (req, res) => {
    await connectDB();
    try {
      const result = await deleteItem(
        req.params.divisionId,
        req.params.audienceId,
        req.params.streamId,
        req.params.categoryId,
        req.params.itemId
      );
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* =========================================================
   PUBLIC VIEW ROUTES
========================================================= */
router.get(
  "/:divisionId/audiences/:audienceId/streams/:streamId/categories/:categoryId/view",
  async (req, res) => {
    await connectDB();
    try {
      const data = await getCategoryViewData(
        req.params.divisionId,
        req.params.audienceId,
        req.params.streamId,
        req.params.categoryId
      );
      res.json(data);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }
);

router.get(
  "/:divisionId/audiences/:audienceId/streams/:streamId/categories/:categoryId/items/:itemId/view",
  async (req, res) => {
    await connectDB();
    try {
      const data = await getItemViewData(
        req.params.divisionId,
        req.params.audienceId,
        req.params.streamId,
        req.params.categoryId,
        req.params.itemId
      );
      res.json(data);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }
);

export default router;
