import express from "express";
import {
  createBattle,
  getBattle,
  getBattles,
} from "../controllers/battleControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validateBattleCreation } from "../middlewares/validationMiddleware.js";
import passport from "passport";

const router = express.Router();

router.get("/", getBattles);
router.get("/:id", getBattle);
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  validateBattleCreation,
  createBattle
);

export default router;
