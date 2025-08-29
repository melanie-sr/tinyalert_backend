import Player from "../models/player.js";

export async function createOrGetPlayer(req, res) {
  try {
    const { roblox_id, playerName, avatar_url } = req.body;

    let player = await Player.findOne({ roblox_id });
    if (!player) {
      player = await Player.create({ roblox_id, playerName, avatar_url });
    }

    res.json(player);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
