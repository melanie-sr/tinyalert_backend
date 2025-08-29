import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  map: { type: mongoose.Schema.Types.ObjectId, ref: "Map" },
  server: { type: mongoose.Schema.Types.ObjectId, ref: "Server" },
  score: Number,
  rank: Number,
  played_at: { type: Date, default: Date.now },
});

export default mongoose.model("Score", scoreSchema);
