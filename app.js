// app.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import authRoutes from "./routes/auth.js"; // ✅ le bon fichier
import userRoutes from "./routes/users.js";
import scoreRoutes from "./routes/scores.js";

const app = express();

/* ---------- CORS (prod + preview + local) ---------- */
const FRONTEND_URL = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
const FRONTEND_URL_PREVIEW = (process.env.FRONTEND_URL_PREVIEW || "").replace(
  /\/$/,
  ""
);
const allowedOrigins = [
  FRONTEND_URL,
  FRONTEND_URL_PREVIEW,
  "http://localhost:5173",
].filter(Boolean);

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function matchWildcard(pattern, value) {
  const re = new RegExp(
    "^" + pattern.split("*").map(escapeRegExp).join(".*") + "$"
  );
  return re.test(value);
}
function isAllowedOrigin(origin) {
  const o = (origin || "").replace(/\/$/, "");
  return allowedOrigins.some((pat) =>
    pat.includes("*") ? matchWildcard(pat, o) : pat === o
  );
}

// Pré-vol en tête (ne touche pas la DB)
app.use((req, res, next) => {
  if (req.method !== "OPTIONS") return next();
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    const reqHeaders = req.headers["access-control-request-headers"];
    if (reqHeaders) res.setHeader("Access-Control-Allow-Headers", reqHeaders);
  }
  return res.status(204).end();
});

// En-têtes CORS pour les vraies requêtes
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  next();
});

/* ---------- Parseurs ---------- */
app.use(cookieParser());
app.use(express.json());

/* ---------- Connexion Mongo AVANT les routes ---------- */
let mongoReady = global.mongoReady || null;
app.use(async (_req, _res, next) => {
  try {
    if (!mongoReady) {
      mongoReady = connectDB(); // doit lire MONGODB_URI et ne PAS utiliser d'options dépréciées
      global.mongoReady = mongoReady;
    }
    await mongoReady;
    next();
  } catch (err) {
    next(err);
  }
});

/* ---------- Health & Debug ---------- */
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "tinyalert-backend",
    uptime: process.uptime(),
  });
});
app.get("/api/_debug/db", (_req, res) => {
  res.json({
    readyState: mongoose.connection.readyState, // 0=disc, 1=conn, 2=connecting
    host: mongoose.connection.host || null,
    db: mongoose.connection.name || null,
  });
});

/* ---------- Routes ---------- */
app.use("/api/auth", authRoutes); // ✅ login/register/logout
app.use("/api/users", userRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api", routes);

/* ---------- Handler d'erreurs JSON ---------- */
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err?.stack || err);
  res.status(500).json({ error: "Internal Server Error" });
});

/* ---------- Export serverless pour Vercel ---------- */
export default function handler(req, res) {
  return app(req, res);
}

// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import routes from "./routes/index.js";
// import authRoutes from "./routes/users.js";
// import scoreRoutes from "./routes/scores.js";

// const app = express();

// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
// app.use(cookieParser());
// app.use(express.json());

// app.use("/api", routes);
// app.use("/api/auth", authRoutes);
// app.use("/api/scores", scoreRoutes);

// export default app;
