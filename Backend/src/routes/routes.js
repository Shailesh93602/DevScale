import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import roadMapRoutes from './roadMapRoutes.js';
import questionRoutes from './questionRoutes.js';
import leaderBoardRoutes from './leaderBoardRoutes.js';
import placementRoutes from './placementRoutes.js';
import communityForumRoutes from './communityForumRoutes.js'; 
import jobRoutes from './jobRoutes.js';
import chatRoutes from './chatRoutes.js';
import courseRoutes from './courseRoutes.js';
import battleRoutes from './battleRoutes.js';
import passport from "passport";
import { isAlreadyLoggedIn } from "../middleware/isAlreadyLoggedIn.js";

const router = express.Router();

router.use("/auth", isAlreadyLoggedIn, authRoutes);
router.use(
    "/profile",
    passport.authenticate("jwt", {
      session: false,
      failureRedirect: "/sessionEnd",
    }),
    userRoutes
  );

  router.use(
    "/roadMaps",
    passport.authenticate("jwt", {
      session: false,
      failureRedirect: "/sessionEnd",
    }),
    roadMapRoutes
  );

  router.use(
    "/questions",
    passport.authenticate("jwt", {
      session: false,
      failureRedirect: "/sessionEnd",
    }),
    questionRoutes
  );

  router.use(
    "/leaderBoard",
    passport.authenticate("jwt", {
      session: false,
      failureRedirect: "/sessionEnd",
    }),
    leaderBoardRoutes
  );

  router.use(
    "/placements",
    passport.authenticate("jwt", {
      session: false,
      failureRedirect: "/sessionEnd",
    }),
    placementRoutes
  );

  router.use(
    "/community/forums",
    passport.authenticate("jwt", {
      session: false,
      failureRedirect: "/sessionEnd",
    }),
    communityForumRoutes
  );
  
  router.use(
    "/jobs",
    passport.authenticate("jwt", {
      session: false,
      failureRedirect: "/sessionEnd",
    }),
    jobRoutes
  );

  router.use(
    "/chats",
    passport.authenticate("jwt", {
      session: false,
      failureRedirect: "/sessionEnd",
    }),
    chatRoutes
  );

  router.use(
    "/courses",
    passport.authenticate("jwt", {
      session: false,
      failureRedirect: "/sessionEnd",
    }),
    courseRoutes
  );

  router.use(
    "/battle",
    passport.authenticate("jwt", {
      session: false,
      failureRedirect: "/sessionEnd",
    }),
    battleRoutes
  );


export default router;