import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import roadMapRoutes from "./roadMapRoutes.js";
import questionRoutes from "./questionRoutes.js";
import leaderBoardRoutes from "./leaderBoardRoutes.js";
import placementRoutes from "./placementRoutes.js";
import communityForumRoutes from "./communityForumRoutes.js";
import jobRoutes from "./jobRoutes.js";
import chatRoutes from "./chatRoutes.js";
import courseRoutes from "./courseRoutes.js";
import battleRoutes from "./battleRoutes.js";
import passport from "passport";
import { codeRunner } from "../controllers/codeRunnerController.js";
import { predict } from "../controllers/predectionController.js";

const router = express.Router();

router.post("/predict", predict);
router.use("/auth", authRoutes);
router.use(
  "/profile",
  passport.authenticate("jwt", {
    session: false,
  }),
  userRoutes
);

router.use(
  "/roadMaps",
  passport.authenticate("jwt", {
    session: false,
  }),
  roadMapRoutes
);

router.use(
  "/questions",
  passport.authenticate("jwt", {
    session: false,
  }),
  questionRoutes
);

router.use(
  "/leaderBoard",
  passport.authenticate("jwt", {
    session: false,
  }),
  leaderBoardRoutes
);

router.use(
  "/placements",
  passport.authenticate("jwt", {
    session: false,
  }),
  placementRoutes
);

router.use(
  "/community/forums",
  passport.authenticate("jwt", {
    session: false,
  }),
  communityForumRoutes
);

router.use(
  "/jobs",
  passport.authenticate("jwt", {
    session: false,
  }),
  jobRoutes
);

router.use(
  "/chats",
  passport.authenticate("jwt", {
    session: false,
  }),
  chatRoutes
);

router.use(
  "/courses",
  passport.authenticate("jwt", {
    session: false,
  }),
  courseRoutes
);

router.use(
  "/battle",
  passport.authenticate("jwt", {
    session: false,
  }),
  battleRoutes
);

router.post("/run-code", codeRunner);

export default router;
