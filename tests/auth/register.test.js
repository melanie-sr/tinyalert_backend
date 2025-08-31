import dotenv from "dotenv";
dotenv.config();

import request from "supertest";
import app from "../../app.js";
import User from "../../models/user.js";
import { connectDB, disconnectDB,clearDB } from "../setup/db.js";

beforeAll(connectDB);
afterAll(clearDB);
afterAll(disconnectDB);

describe("Register", () => {
  it("crée un utilisateur avec succès", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "melia",
      lastName: "smati",
      email: "melia@example.com",
      password: "motdepasse.12",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("userId");
  });

  it("email déjà utilisé", async () => {
    await User.create({
      firstName: "nolan",
      lastName: "costa",
      email: "melia@example.com",
      password: "fakePassword",
    });

    const res = await request(app).post("/api/auth/register").send({
      firstName: "melia",
      lastName: "smati",
      email: "melia@example.com",
      password: "motdepasse",
    });

    expect(res.statusCode).toBe(400);
  });
});
