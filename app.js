import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import authRoutes from "./routes/users.js";
import scoreRoutes from "./routes/scores.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.use("/api", routes);
app.use("/api/auth", authRoutes);
app.use("/api/scores", scoreRoutes);


export default app;
