import express from "express";
import { getMe } from "../controllers/userController.js";
import { updateProfile } from "../controllers/userController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", getMe);

router.put("/updateProfile", authenticateUser, updateProfile);

export default router;
