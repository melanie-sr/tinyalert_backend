import express from "express";
import {
  getMe,
  updateProfile,
  deleteProfile,
} from "../controllers/userController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", authenticateUser , getMe);

router.put("/updateProfile", authenticateUser, updateProfile);

router.delete("/deleteProfile", authenticateUser, deleteProfile);

export default router;
