import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import passport from "passport";
import { isAlreadyLoggedIn } from "../middleware/isAlreadyLoggedIn.js";

const router = express.Router();

router.use("/auth", isAlreadyLoggedIn, authRoutes);
router.use(
    "/user",
    passport.authenticate("jwt", {
      session: false,
      failureRedirect: "/sessionEnd",
    }),
    userRoutes
  );

export default router;