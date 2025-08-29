import express from "express";
import playerRoutes from "./players.js";
import scoreRoutes from "./scores.js";
import authRoutes from "./auth.js";
import usersRoutes from "./users.js";

const router = express.Router();

router.use("/players", playerRoutes);
router.use("/scores", scoreRoutes);
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);

export default router;
