import dotenv from "dotenv";
dotenv.config();

import request from "supertest";
import app from "../../app.js";
import { connectDB, disconnectDB, clearDB } from "../setup/db.js";

beforeAll(connectDB);
afterAll(disconnectDB);
afterEach(clearDB);

describe("Test pour le logout", () => {
  it("Déconnexion réussie", async () => {
    const res = await request(app).post("/api/auth/logout");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Déconnecté");
  });
});
