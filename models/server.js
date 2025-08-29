import mongoose from "mongoose";

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  map: { type: mongoose.Schema.Types.ObjectId, ref: "Map" },
});

export default mongoose.model("Server", serverSchema);
