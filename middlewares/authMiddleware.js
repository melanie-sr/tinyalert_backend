// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// const isProd = process.env.NODE_ENV === "production";

function extractToken(req) {
  const fromCookie = req.cookies?.token;
  if (fromCookie) return fromCookie;
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: "Non authentifié" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password -__v");
    if (!user) return res.status(401).json({ message: "Session invalide" });

    req.user = user; // user complet sans password
    req.userId = user.id; // raccourci si besoin
    next();
  } catch (e) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
}

/** Optionnel : middleware qui n'échoue pas si non connecté */
export async function optionalAuth(req, _res, next) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password -__v");
    if (user) req.user = user;
  } catch {
    // ignore
  }
  next();
}
