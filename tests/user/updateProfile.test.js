import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import app from "../../app.js";
import User from "../../models/user.js";
import { connectDB, disconnectDB, clearDB } from "../setup/db.js";
import dotenv from "dotenv";
dotenv.config();

beforeAll(connectDB);
afterAll(disconnectDB);
afterEach(clearDB);

describe("Test pour mettre à jour le profile", () => {
  let user;
  let token;

  beforeEach(async () => {
    // Crée un utilisateur pour chaque test
    user = await User.create({
      firstName: "Melia",
      lastName: "Smati",
      email: "melia@test.com",
      password: await bcrypt.hash("motdepasse123", 10),
    });

    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  });

  it("met à jour prénom et nom avec succès", async () => {
    const res = await request(app)
      .put("/api/auth/updateProfile")
      .set("Cookie", [`token=${token}`])
      .send({ firstName: "melanie", lastName: "costa" });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.firstName).toBe("melanie");
    expect(res.body.user.lastName).toBe("costa");
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("met à jour prénom, nom et mot de passe avec succès", async () => {
    const res = await request(app)
      .put("/api/auth/updateProfile")
      .set("Cookie", [`token=${token}`])
      .send({ firstName: "Melia", lastName: "Smati", password: "nouveaupass123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.firstName).toBe("Melia");
    expect(res.body.user.lastName).toBe("Smati");

    const updated = await User.findById(user._id);
    const isMatch = await bcrypt.compare("nouveaupass123", updated.password);
    expect(isMatch).toBe(true);
  });

  it("retourne 400 si prénom ou nom manquant", async () => {
    const res = await request(app)
      .put("/api/auth/updateProfile")
      .set("Cookie", [`token=${token}`])
      .send({ firstName: "", lastName: "costa" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Prénom et nom requis");
  });

  it("retourne 400 si mot de passe trop court", async () => {
    const res = await request(app)
      .put("/api/auth/updateProfile")
      .set("Cookie", [`token=${token}`])
      .send({ firstName: "Melia", lastName: "Smati", password: "123" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/au moins 8 caractères/);
  });

  it("retourne 404 si utilisateur inexistant", async () => {
    const fakeId = "64b123456789012345678901"; 
    const fakeToken = jwt.sign({ id: fakeId }, process.env.JWT_SECRET);

    const res = await request(app)
      .put("/api/auth/updateProfile")
      .set("Cookie", [`token=${fakeToken}`])
      .send({ firstName: "X", lastName: "Y" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Utilisateur non trouvé");
  });

  

  
});
