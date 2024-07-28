import express from "express";
import {
  createBattle,
  getBattle,
  getBattles,
} from "../controllers/battleControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validateBattleCreation } from "../middlewares/validationMiddleware.js"; // Import validation middleware if needed
import passport from "passport";

const router = express.Router();

// Route to get all battles
router.get("/", getBattles);

// Route to get a specific battle by ID
router.get("/:id", getBattle);

// Route to create a new battle
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  validateBattleCreation,
  createBattle
);

export default router;
