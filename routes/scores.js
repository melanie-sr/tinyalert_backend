import express from "express";
import {
  createScore,
  getPlayerScores,
} from "../controllers/scoresController.js";

const router = express.Router();

router.post("/", createScore); // POST /api/scores
router.get("/:playerId", getPlayerScores); // GET /api/scores/:playerId

export default router;
