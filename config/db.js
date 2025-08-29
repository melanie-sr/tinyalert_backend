import mongoose from "mongoose";

export default async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI; // tolère l'un ou l'autre
  if (!uri) {
    throw new Error("Missing MONGODB_URI (ou MONGO_URI) in env");
  }
  // Si déjà connectée, réutiliser
  if (mongoose.connection.readyState === 1) return mongoose;
  // Evite les connexions concurrentes: stocke une promesse globale
  if (!global.__mongooseConnPromise) {
    global.__mongooseConnPromise = mongoose.connect(uri); // pas d'options dépréciées
  }

  try {
    await global.__mongooseConnPromise;
    return mongoose;
  } catch (err) {
    // Si échec, réinitialiser pour permettre une nouvelle tentative
    global.__mongooseConnPromise = null;
    throw err;
  }
}

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
