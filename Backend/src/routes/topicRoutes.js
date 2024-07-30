import express from "express";
import { getUnpublishedTopics } from "../controllers/topicController.js";

const router = express.Router();

router.get("/unpublished", getUnpublishedTopics);

export default router;
