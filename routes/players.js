import express from "express";
import { createOrGetPlayer } from "../controllers/playersController.js";

const router = express.Router();
router.post("/", createOrGetPlayer); // POST /api/players

export default router;
