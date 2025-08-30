import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const isProd = process.env.NODE_ENV === "production";
const cookieOpts = {
  httpOnly: true,
  sameSite: isProd ? "lax" : "lax", // même origine via proxy => Lax suffit
  secure: isProd, // true en prod (HTTPS)
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function register(req, res) {
  try {
    const { firstName, lastName, email, password } = req.body;
    const normEmail = (email || "").toLowerCase().trim();

    const existing = await User.findOne({ email: normEmail });
    if (existing)
      return res.status(400).json({ message: "Email déjà utilisé" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email: normEmail,
      password: hashed,
    });

    return res
      .status(201)
      .json({ message: "Utilisateur créé", userId: user._id });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function login(req, res) {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax", // même origine via proxy => Lax suffit
    secure: isProd, // true en prod (HTTPS)
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  try {
    const { email, password } = req.body;
    const normEmail = (email || "").toLowerCase().trim();

    const user = await User.findOne({ email: normEmail });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Adresse mail ou mot de passe incorrect" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Adresse mail ou mot de passe incorrect" });
    }

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ error: "Configuration serveur manquante (JWT_SECRET)" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res
      .cookie("token", token, cookieOpts)
      .status(200)
      .json({ message: "Connexion réussie", userId: user._id });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

export function logout(req, res) {
  return res
    .clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
    })
    .status(200)
    .json({ message: "Déconnecté" });
}
