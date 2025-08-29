import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  roblox_id: { type: Number, required: true, unique: true },
  playerName: String,
  avatar_url: String,
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("Player", playerSchema);
