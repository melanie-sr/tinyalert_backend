import dotenv from "dotenv";
dotenv.config(); // loads variables into process.env

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
// import mongoose from "mongoose";
import routes from "./routes/index.js";
// import authRoutes from "./routes/auth.js";
// import userRoutes from "./routes/users.js";

import "./models/map.js";
import "./models/server.js";

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL;
const FRONTEND_URL_PREVIEW = process.env.FRONTEND_URL_PREVIEW;
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

// Répondre aux pré-vols ici, sans toucher à la DB ni à d'autres middlewares
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

function corsOptionsDelegate(req, cb) {
  const origin = (req.header("Origin") || "").replace(/\/$/, "");
  cb(null, {
    origin: isAllowedOrigin(origin) ? origin : false,
    credentials: true,
  });
}
app.use(cors(corsOptionsDelegate));

app.use(cookieParser());
app.use(express.json());

// function corsOptionsDelegate(req, cb) {
//   const origin = req.header("Origin");
//   if (!origin) return cb(null, { origin: false }); // requête sans Origin (ex: healthcheck) -> pas de CORS
//   const isAllowed = allowedOrigins.some((o) =>
//     o.includes("*") ? matchWildcard(o, origin) : o === origin
//   );
//   // IMPORTANT: ne pas throw; renvoyer origin:false si non autorisé
//   cb(null, { origin: isAllowed ? origin : false, credentials: true });
// }

// function matchWildcard(pattern, value) {
//   const re = new RegExp(
//     "^" + pattern.split("*").map(escapeRegExp).join(".*") + "$"
//   );
//   return re.test(value);
// }
// function escapeRegExp(s) {
//   return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }

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

app.options("*", cors(corsOptionsDelegate)); // autorise le pré-vol globalement

app.use("/api", routes);
// app.use("/api/users", userRoutes);
// app.use("/api/auth", authRoutes);

/** === Export serverless handler pour Vercel === */
// @vercel/node attend une fonction (req,res) -> app(req,res)
export default function handler(req, res) {
  return app(req, res);
}
