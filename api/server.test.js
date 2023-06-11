// testleri buraya yazın
const request = require("supertest");
const server = require("./server");
const db = require("../data/dbConfig");
const bcryptjs = require("bcryptjs");

afterAll(async () => {
  await db.destroy();
});

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
  await db.seed.run();
});

test("[0] Testler çalışır durumda]", () => {
  expect(true).toBe(true);
});

describe("Auth tests", () => {
  it("[1] Register", async () => {
    let model = { username: "cemre", password: "1234" };
    let actual = await request(server).post("/api/auth/register").send(model);
    expect(actual.status).toBe(201);
    expect(actual.body.id).toBeGreaterThan(0);
  });
  it("[2] password hash", async () => {
    let model = { username: "cemre13", password: "1234" };
    let actual = await request(server).post("/api/auth/register").send(model);
    let isHashed = bcryptjs.compareSync(model.password, actual.body.password);
    expect(actual.status).toBe(201);
    expect(isHashed).toBeTruthy();
  });
  it("[3] Login token dönüyor mu", async () => {
    let model = { username: "bob", password: "1234" };
    let actual = await request(server).post("/api/auth/login").send(model);
    expect(actual.status).toBe(200);
    expect(actual.body.token).toBeDefined();
  });
  it("[4] Login eksik payload hata durumu", async () => {
    let model = { username: "bob" };
    let actual = await request(server).post("/api/auth/login").send(model);
    expect(actual.status).toBe(400);
  });
});
describe("Bilmeceler test", () => {
  it("[5] token geçerliyken bilmeceler geliyor mu", async () => {
    let model = { username: "bob", password: "1234" };
    let login = await request(server).post("/api/auth/login").send(model);
    let actual = await request(server)
      .get("/api/bilmeceler")
      .set("authorization", login.body.token);

    expect(actual.status).toBe(200);
    expect(actual.body.length).toBe(3);
  });
  it("[6]logout kullanıcıda bilmeceler çalışıyor mu  ", async () => {
    let model = { username: "bob", password: "1234" };
    let login = await request(server).post("/api/auth/login").send(model);
    await request(server)
      .get("/api/auth/logout")
      .send(model)
      .set("authorization", login.body.token);
    let actual = await request(server)
      .get("/api/bilmeceler")
      .set("authorization", login.body.token);
    expect(actual.status).toBe(400);
    expect(actual.body.message).toBe(
      "Daha önce çıkış yapılmış. Tekrar giriş yapınız."
    );
  });
});
