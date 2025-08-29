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

const FRONTEND_URL = process.env.FRONTEND_URL;
const allowedOrigins = [FRONTEND_URL, "http://localhost:5173"].filter(Boolean);

// Autorise le front en prod ET en local
// const allowedOrigins = [
//   process.env.FRONTEND_URL,
//   "http://localhost:5173",
// ].filter(Boolean);

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: (origin, cb) => {
      // autorise requêtes sans origin (ex: curl, healthchecks)
      if (
        !origin ||
        allowedOrigins.some((o) =>
          o.includes("*") ? matchWildcard(o, origin) : o === origin
        )
      ) {
        return cb(null, true);
      }
      return cb(new Error("CORS not allowed for origin: " + origin));
    },
    credentials: true,
  })
);

function matchWildcard(pattern, value) {
  const re = new RegExp(
    "^" + pattern.split("*").map(escapeRegExp).join(".*") + "$"
  );
  return re.test(value);
}
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

app.use(cookieParser());
app.use(express.json());

/** === Connexion MongoDB avec cache global === */
// await connectDB();
let mongoReady = global.mongoReady || null;
app.use(async (_req, _res, next) => {
  try {
    if (!mongoReady) {
      // connectDB() doit appeler mongoose.connect(process.env.MONGODB_URI) SANS options dépréciées
      mongoReady = connectDB();
      global.mongoReady = mongoReady;
    }
    await mongoReady;
    next();
  } catch (err) {
    next(err);
  }
});

/** === Routes === */
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "tinyalert-backend",
    uptime: process.uptime(),
  });
});

app.use("/api", routes);
// app.use("/api/users", userRoutes);
// app.use("/api/scores", scoreRoutes);
// app.use("/api/auth", authRoutes);

/** === Export serverless handler pour Vercel === */
// @vercel/node attend une fonction (req,res) -> app(req,res)
export default function handler(req, res) {
  return app(req, res);
}

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server started on http://localhost:${PORT}`);
// });
