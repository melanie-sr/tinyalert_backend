import dotenv from "dotenv";
dotenv.config();

import request from "supertest";
import app from "../../app.js";
import { connectDB, disconnectDB, clearDB } from "../setup/db.js";

beforeAll(connectDB);
afterAll(disconnectDB);
afterEach(clearDB);

describe("Test pour le login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      firstName: "melia",
      lastName: "smati",
      email: "melia@example.com",
      password: "motdepasse.12",
    });
  });

  it("Connexion réussie avec bon email/mdp", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "melia@example.com",
      password: "motdepasse.12",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("userId");
    expect(res.headers["set-cookie"]).toBeDefined(); 
  });

  it("Connexion échoue avec mauvais mot de passe", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "melia@example.com",
      password: "Secret123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Adresse mail ou mot de passe incorrect");
  });

  it("Connexion échoue avec email inconnu", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "inconnu@example.com",
      password: "motdepasse.12",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Adresse mail ou mot de passe incorrect");
  });
});
