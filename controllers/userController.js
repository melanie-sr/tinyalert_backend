import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function getMe(req, res) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Non connecté" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    res.status(200).json({ user });
  } catch (err) {
    res.status(401).json({ message: "Token invalide" });
  }
}

export async function updateProfile(req, res) {
  const userId = req.user.id;
  const { firstName, lastName, password } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({ message: "Prénom et nom requis" });
  }

  try {
    const updates = { firstName, lastName };

    if (password && password.trim().length > 0) {
      if (password.length < 8) {
        return res.status(400).json({
          message: "Le mot de passe doit contenir au moins 8 caractères",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({
      message: "Profil mis à jour avec succès",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Erreur updateProfile:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function deleteProfile(req, res) {
  const userId = req.user.id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Si tu utilises des cookies pour le token, on peut aussi le supprimer
    res.clearCookie("token");

    res.status(200).json({
      message: "Profil supprimé avec succès",
    });
  } catch (err) {
    console.error("Erreur deleteProfile:", err);
    res.status(500).json({ error: err.message });
  }
}
