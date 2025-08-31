import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app.js";
import User from "../../models/user.js";
import { connectDB, disconnectDB, clearDB } from "../setup/db.js";
import dotenv from "dotenv";
dotenv.config();

beforeAll(connectDB);
afterAll(disconnectDB);
afterEach(clearDB);

describe("Test pour le token", () => {
  let user;

  beforeAll(async () => {
    user = await User.create({
      firstName: "Melia",
      lastName: "Smati",
      email: "melia@example.com",
      password: "hashedpass",
    });
  });

  it("retourne l'utilisateur connecté si token valide", async () => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", [`token=${token}`]); // le cookie

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("melia@example.com");
    expect(res.body.user).not.toHaveProperty("hashedpass");
  });

  it("retourne 401 si pas de token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Non authentifié");
  });

  it("retourne 401 si token invalide", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", ["token=faketoken"]);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Token invalide");
  });
});
