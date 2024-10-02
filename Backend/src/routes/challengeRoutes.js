import express from "express";
import {
  getChallenge,
  getChallenges,
} from "../controllers/challengeController.js";
const router = express.Router();

router.get("/", getChallenges);
router.get("/:id", getChallenge);

export default router;
