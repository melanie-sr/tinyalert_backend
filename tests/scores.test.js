import request from "supertest";
import app from "../app.js";
import { connectDB, disconnectDB, clearDB } from "./setup/db.js";
import Player from "../models/player.js";
import Map from "../models/map.js";
import Server from "../models/server.js";
import Score from "../models/score.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

beforeAll(connectDB);
afterAll(disconnectDB);
afterEach(clearDB);

describe("Test des Scores", () => {
  let player, map, server, token;

  beforeAll(async () => {
    player = await Player.create({
      firstName: "PlayerM",
      lastName: "two",
      email: "player1@pop.com",
      password: "mel1234pass",
    });

    map = await Map.create({ name: "Map1", type: "test" });

    server = await Server.create({ name: "Server1", map: map._id });

    token = jwt.sign({ id: player._id }, process.env.JWT_SECRET);
  });

  it("crée un score avec succès", async () => {
    const res = await request(app)
      .post("/api/scores")
      .set("Cookie", [`token=${token}`])
      .send({
        player_id: player._id,
        map_id: map._id,
        server_id: server._id,
        score: 1000,
        rank: 1,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("score");
    expect(res.body.score.score).toBe(1000);
    expect(res.body.score.player._id.toString()).toBe(player._id.toString());
    expect(res.body.score.map._id.toString()).toBe(map._id.toString());
    expect(res.body.score.server._id.toString()).toBe(server._id.toString());
  });

  it("retourne tous les scores d'un joueur", async () => {
    await Score.create({
      player: player._id,
      map: map._id,
      server: server._id,
      score: 500,
      rank: 2,
    });
    await Score.create({
      player: player._id,
      map: map._id,
      server: server._id,
      score: 1200,
      rank: 1,
    });
    const res = await request(app)
      .get(`/api/scores/player/${player._id}`)
      .set("Cookie", [`token=${token}`]); 
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].score).toBe(1200);
    expect(res.body[1].score).toBe(500);
  });

});
