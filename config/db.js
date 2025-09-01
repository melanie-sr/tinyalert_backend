import mongoose from "mongoose";

mongoose.set("strictQuery", true);
mongoose.set("bufferCommands", false);

let connPromise = null;

export default async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGODB_URI (ou MONGO_URI)");

  if (mongoose.connection.readyState === 1) return mongoose; // déjà connecté

  if (!connPromise) {
    // Si l'URI n'a pas de /db, on force via MONGODB_DB (ou 'tinyalert')
    const hasDbInUri = /mongodb(\+srv)?:\/\/[^/]+\/([^?]+)/.test(uri);
    const opts = {
      serverSelectionTimeoutMS: 10000, // échouer vite si cluster injoignable
      socketTimeoutMS: 45000,
      ...(hasDbInUri ? {} : { dbName: process.env.MONGODB_DB || "tinyalert" }),
    };
    connPromise = mongoose.connect(uri, opts);
  }

  try {
    await connPromise;
    return mongoose;
  } catch (err) {
    connPromise = null; // reset pour permettre une nouvelle tentative
    // Log lisible dans les logs Vercel
    console.error(
      "Mongo connect error:",
      err?.name,
      err?.message,
      err?.reason?.message
    );
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
