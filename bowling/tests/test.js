process.env.NODE_ENV = "test";
const sequelize = require("../database/database");
const request = require("supertest");
const app = require("../app");

let dateNowSpy;

    beforeAll(async (done) => {
        await sequelize.query(`INSERT INTO "users" ("id", "name") VALUES (1, 'garrett')`);
        await sequelize.query(`INSERT INTO "games" ("id", "userId", "runningScore") VALUES (1, 1,0)`);
        done()
    });

    afterAll(async (done) => {
        await sequelize.query("DELETE FROM frames");
        await sequelize.query("DELETE FROM games");
        await sequelize.query("DELETE FROM users");
        sequelize.close();
        done()
    });

    describe("/throw", () => {
        test("A user should have 3 attempts if he scores a strike in the first attempt", async (done) => {
            const response = await request(app).post("/throw").send({
                gameId: 1, 
                userId: 1, 
                score: 10
            });

            console.log('response', JSON.stringify(response.body))
            await expect(response.status).toEqual(200)
            console.log('typeof', typeof response.body.data.game[1].updatedAt)
            await expect(response.body).toMatchObject({
                "data":  {
                    "frame": {
                        "allowedAttempts": 3,
                        "attempts": 1,
                        "frameNumber": 1,
                        "gameId": 1,
                        "score": 0,
                        "userId": 1,
                    },
                },
                "message": "Score applied to frame!",
                "status": 200
            });

            await expect(response.body.data.game[1]).toMatchObject({
                            "id": 1,
                            "createdAt": null,
                            "updatedAt": expect.any(String),
                            "userId": 1,
                            "runningScore": 10,
            })
            done()
        });

        // test("A user should have 3 attempts if he scores a a spare", async () => {
        //     const response = await request(app).get("/");
        //     expect(response.body).toEqual(["Elie", "Matt", "Joel", "Michael"]);
        //     expect(response.statusCode).toBe(200);
        // });

        // test("A user should have 3 attempts if he scores a a spare", async () => {
        //     const response = await request(app).get("/");
        //     expect(response.body).toEqual(["Elie", "Matt", "Joel", "Michael"]);
        //     expect(response.statusCode).toBe(200);
        // });

    });
