import mongoose from "mongoose";

export async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI non défini");
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Connecté à la DB pour tests");
}

export async function disconnectDB() {
  await mongoose.connection.close();
  console.log("Déconnecté de la DB");
}

export async function clearDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany(); // vide toutes les collections
  }
}
