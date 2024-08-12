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
import resourceRoutes from "./resourceRoutes.js";
import topicRoutes from "./topicRoutes.js";
import articleRoutes from "./articleRoutes.js";
import quizRoutes from "./quizRoutes.js";
import passport from "passport";
import { codeRunner } from "../controllers/codeRunnerController.js";
import { predict } from "../controllers/predictionController.js";

const router = express.Router();

// Simple test route
router.get("/helloworld", (req, res) => res.send("Hello World!"));

// Prediction route
router.post("/predict", predict);

// Auth routes
router.use("/auth", authRoutes);

// Routes requiring authentication
router.use(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  userRoutes
);

router.use(
  "/roadMaps",
  passport.authenticate("jwt", { session: false }),
  roadMapRoutes
);

router.use(
  "/questions",
  passport.authenticate("jwt", { session: false }),
  questionRoutes
);

router.use(
  "/leaderBoard",
  passport.authenticate("jwt", { session: false }),
  leaderBoardRoutes
);

router.use(
  "/placements",
  passport.authenticate("jwt", { session: false }),
  placementRoutes
);

router.use(
  "/community/forums",
  passport.authenticate("jwt", { session: false }),
  communityForumRoutes
);

router.use(
  "/jobs",
  passport.authenticate("jwt", { session: false }),
  jobRoutes
);

router.use(
  "/chats",
  passport.authenticate("jwt", { session: false }),
  chatRoutes
);

router.use(
  "/courses",
  passport.authenticate("jwt", { session: false }),
  courseRoutes
);

router.use(
  "/battles",
  passport.authenticate("jwt", { session: false }),
  battleRoutes
);

router.use(
  "/resources",
  passport.authenticate("jwt", { session: false }),
  resourceRoutes
);

router.use(
  "/topics",
  passport.authenticate("jwt", { session: false }),
  topicRoutes
);

router.use(
  "/articles",
  passport.authenticate("jwt", { session: false }),
  articleRoutes
);

router.use(
  "/quiz",
  passport.authenticate("jwt", { session: false }),
  quizRoutes
);

// Code runner route
router.post("/run-code", codeRunner);

export default router;
