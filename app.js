// app.js — Backend TinyAlert (Express sur Vercel, ESM)

import dotenv from "dotenv";
dotenv.config(); // 1 seule fois, tout en haut

import express from "express";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";

// (si tes modèles ont des side-effects d'init)
import "./models/map.js";
import "./models/server.js";

const app = express();

/* ------------------------------
   1) Origines autorisées
------------------------------ */
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

/* ------------------------------------------------
   2) Préflight CORS (OPTIONS) — tout en haut
      -> ne touche ni à la DB ni à autre chose
------------------------------------------------- */
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

/* ------------------------------------------------
   3) En-têtes CORS pour TOUTES les vraies requêtes
      (GET/POST/...) — simples et robustes
------------------------------------------------- */
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  next();
});

/* ------------------------------
   4) Parseurs
------------------------------ */
app.use(cookieParser());
app.use(express.json());

/* ------------------------------
   5) Connexion MongoDB (cache)
------------------------------ */
let mongoReady = global.mongoReady || null;
app.use(async (_req, _res, next) => {
  try {
    if (!mongoReady) {
      mongoReady = connectDB(); // doit faire mongoose.connect(...) SANS options dépréciées
      global.mongoReady = mongoReady;
    }
    await mongoReady;
    next();
  } catch (err) {
    next(err);
  }
});

/* ------------------------------
   6) Routes
------------------------------ */
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "tinyalert-backend",
    uptime: process.uptime(),
  });
});

// sous-routes
app.use("/api", routes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

/* ------------------------------
   7) Gestion d'erreur JSON
------------------------------ */
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err?.stack || err);
  res.status(500).json({ error: "Internal Server Error" });
});

/* ------------------------------
   8) Export serverless (Vercel)
------------------------------ */
export default function handler(req, res) {
  return app(req, res);
}
