import express from "express";
import { getMe, updateProfile } from "../controllers/userController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", requireAuth, getMe);
router.put("/updateProfile", requireAuth, updateProfile);

export default router;
