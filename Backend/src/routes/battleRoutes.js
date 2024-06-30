import express from "express";
import {
  createBattle,
  getBattle,
  getBattles,
} from "../controllers/battleControllers.js";

const router = express.Router();

router.get("/", getBattles);
router.get("/:id", getBattle);
router.post("/create", createBattle);

export default router;
