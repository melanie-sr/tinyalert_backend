import mongoose from "mongoose";

const mapSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
});

export default mongoose.model("Map", mapSchema);
