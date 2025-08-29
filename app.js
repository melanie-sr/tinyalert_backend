import dotenv from "dotenv";
dotenv.config(); // loads variables into process.env

import express from "express";
import mongoose from "mongoose";
import routes from "./routes/index.js";
import connectDB from "./config/db.js";
import userRoutes from "./routes/users.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import scoreRoutes from "./routes/scores.js";
import authRoutes from "./routes/auth.js";
import "./models/map.js";
import "./models/server.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

await connectDB(); // MongoDB connection

app.use("/api", routes);
// app.use("/api/users", userRoutes);
// app.use("/api/scores", scoreRoutes);
// app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
