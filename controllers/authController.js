import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function register(req, res) {
  const { firstName, lastName, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email déjà utilisé" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Utilisateur créé", userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!user || !isMatch)
      return res
        .status(400)
        .json({ message: "Adresse mail ou mot de passe incorrect" });

    // Créer un token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // L'envoyer dans un cookie httpOnly
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "Lax", // ou "None" + secure: true en prod
        // sameSite: "None",
        // secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      })
      .status(200)
      .json({ message: "Connexion réussie", userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Lax",
  });
  res.status(200).json({ message: "Déconnecté" });
}
