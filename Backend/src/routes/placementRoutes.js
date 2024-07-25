import express from "express";
import { getBooks, getResources } from "../controllers/placementControllers.js";

const router = express.Router();

// Route to get placement resources
router.get("/resources", getResources);

// Route to get placement books
router.get("/sessions/book", getBooks);

export default router;
