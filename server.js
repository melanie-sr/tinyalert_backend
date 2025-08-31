import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const conn = await connectDB();
    console.log("DB connectée !");
    app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
  } catch (err) {
    console.error("Erreur de démarrage :", err);
  }
}
startServer();

