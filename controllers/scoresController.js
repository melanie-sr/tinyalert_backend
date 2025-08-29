import Score from "../models/score.js";
import "../models/map.js";

export const createScore = async (req, res) => {
  try {
    const { player_id, map_id, server_id, score, rank, played_at } = req.body;

    const newScore = new Score({
      player: player_id,
      map: map_id,
      server: server_id,
      score,
      rank,
      played_at: played_at ? new Date(played_at) : undefined,
    });

    await newScore.save();

    const populatedScore = await newScore.populate("player map server");

    res.status(201).json({
      message: "Score successfully recorded",
      score: populatedScore,
    });
  } catch (error) {
    console.error("Score creation error:", error);
    res.status(500).json({ error: "Server error during score creation" });
  }
};

export async function getPlayerScores(req, res) {
  try {
    const scores = await Score.find({ player: req.params.playerId })
      .populate("map")
      .populate("server")
      .sort({ played_at: -1 });

    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
