import mongoose from "mongoose";

mongoose.set("strictQuery", true);
mongoose.set("bufferCommands", false);

let connPromise = null;

export default async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGODB_URI (ou MONGO_URI)");

  // Déjà connecté ?
  if (mongoose.connection.readyState === 1) return mongoose;

  // Éviter les connexions concurrentes dans l'environnement serverless
  if (!connPromise) {
    const hasDbInUri = /mongodb(\+srv)?:\/\/[^/]+\/([^?]+)/.test(uri);
    connPromise = mongoose.connect(uri, {
      // Échouer vite si le cluster est injoignable
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      ...(hasDbInUri ? {} : { dbName: process.env.MONGODB_DB || "tinyalert" }),
    });
  }

  try {
    await connPromise;
    return mongoose;
  } catch (err) {
    // reset pour permettre une nouvelle tentative au prochain appel
    connPromise = null;
    throw err;
  }
}

// import mongoose from "mongoose";

// export default async function connectDB() {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("MongoDB connected");
//   } catch (err) {
//     console.error("MongoDB connection error :", err.message);
//     process.exit(1);
//   }
// }
