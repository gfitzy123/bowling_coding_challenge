process.env.NODE_ENV = "test";
const sequelize = require("../database/database");
const request = require("supertest");
const app = require("../app");

    beforeEach(async (done) => {
        await sequelize.query(`INSERT INTO "users" ("id", "name") VALUES (1, 'garrett')`);
        await sequelize.query(`INSERT INTO "games" ("id", "userId", "runningScore") VALUES (1, 1,0)`);
        done()
    });

    // afterEach(async (done) => {
    //     await sequelize.query("DELETE FROM frames");
    //     await sequelize.query("DELETE FROM games");
    //     await sequelize.query("DELETE FROM users");
    //     done()
    // });

    afterAll(async (done) => {
        await sequelize.query("DELETE FROM frames");
        await sequelize.query("DELETE FROM games");
        await sequelize.query("DELETE FROM users");
        sequelize.close();
        done()
    });

    describe("/throw", () => {
        // test("A user should have 3 allowedAttempts if he scores a strike in the first attempt", async (done) => {
        //     const response = await request(app).post("/throw").send({
        //         gameId: 1, 
        //         userId: 1, 
        //         score: 10
        //     });

        //     await expect(response.body).toMatchObject({
        //         "data":  {
        //             "frame": {
        //                 "allowedAttempts": 3,
        //                 "attempts": 1,
        //                 "frameNumber": 1,
        //                 "gameId": 1,
        //                 "score": 0,
        //                 "userId": 1,
        //             },
        //         },
        //         "message": "Score applied to frame!",
        //         "status": 200
        //     });

        //     await expect(response.body.data.game).toMatchObject({
        //                     "id": 1,
        //                     "createdAt": null,
        //                     "updatedAt": expect.any(String),
        //                     "userId": 1,
        //                     "runningScore": 10,
        //     })
        //     done()
        // });

        // test("A user should have 3 allowedAttempts if he scores a a spare", async (done) => {
        //     await request(app).post("/throw").send({
        //         gameId: 1, 
        //         userId: 1, 
        //         score: 5
        //     });

        //     const response = await request(app).post("/throw").send({
        //         gameId: 1, 
        //         userId: 1, 
        //         score: 5
        //     });

        //     await expect(response.status).toEqual(200)

        //     await expect(response.body).toMatchObject({
        //         "data":  {
        //         },
        //         "message": "Score applied to frame!",
        //         "status": 200
        //     });

        //     await expect(response.body.data.frame).toMatchObject({
        //             "allowedAttempts": 3,
        //             "attempts": 2,
        //             "frameNumber": 1,
        //             "gameId": 1,
        //             "score": 10,
        //             "userId": 1,
        //             "createdAt": expect.any(String),
        //             "updatedAt": expect.any(String),
        //     })
            
        //     await expect(response.body.data.game).toMatchObject({
        //         "id": expect.any(Number),
        //         "createdAt": null,
        //         "updatedAt": expect.any(String),
        //         "userId": 1,
        //         "runningScore": 10,
        //     })
        //     done()
        // });


        // test("A user should have the correct score on the first frame after scoring a spare", async (done) => {
        //     await request(app).post("/throw").send({
        //         gameId: 1, 
        //         userId: 1, 
        //         score: 5
        //     });

        //     await request(app).post("/throw").send({
        //         gameId: 1, 
        //         userId: 1, 
        //         score: 5
        //     });

        //     const response =await request(app).post("/throw").send({
        //         gameId: 1, 
        //         userId: 1, 
        //         score: 5
        //     });

        //     await expect(response.status).toEqual(200)

        //     await expect(response.body).toMatchObject({
        //         "data":  {
        //         },
        //         "message": "Score applied to frame!",
        //         "status": 200
        //     });

        //     await expect(response.body.data.frame).toMatchObject({
        //             "allowedAttempts": 3,
        //             "attempts": 3,
        //             "frameNumber": 1,
        //             "gameId": 1,
        //             "score": 15,
        //             "userId": 1,
        //             "createdAt": expect.any(String),
        //             "updatedAt": expect.any(String),
        //     })
            
        //     await expect(response.body.data.game).toMatchObject({
        //         "id": expect.any(Number),
        //         "createdAt": null,
        //         "updatedAt": expect.any(String),
        //         "userId": 1,
        //         "runningScore": 15,
        //     })
        //     done()
        // });

        // test("A user should have the correct score and attempts on 2 frames", async (done) => {
        //     await request(app).post("/throw").send({
        //         gameId: 1, 
        //         userId: 1, 
        //         score: 7
        //     });

        //     await request(app).post("/throw").send({
        //         gameId: 1, 
        //         userId: 1, 
        //         score: 2
        //     });

        //     const response = await request(app).post("/throw").send({
        //         gameId: 1, 
        //         userId: 1, 
        //         score: 5
        //     });

        //     await expect(response.status).toEqual(200)

        //     await expect(response.body).toMatchObject({
        //         "data":  {
        //         },
        //         "message": "Score applied to frame!",
        //         "status": 200
        //     });

        //     await expect(response.body.data.frame).toMatchObject({
        //             "allowedAttempts": 2,
        //             "attempts": 3,
        //             "frameNumber": 1,
        //             "gameId": 1,
        //             "score": 14,
        //             "userId": 1,
        //             "createdAt": expect.any(String),
        //             "updatedAt": expect.any(String),
        //     })
            
        //     await expect(response.body.data.game).toMatchObject({
        //         "id": expect.any(Number),
        //         "createdAt": null,
        //         "updatedAt": expect.any(String),
        //         "userId": 1,
        //         "runningScore": 14,
        //     })
        //     done()
        // });

        test("A user should have the correct score after playing an entire game", async (done) => {
            await request(app).post("/throw").send({
                gameId: 1, 
                userId: 1, 
                score: 10
            });

            await request(app).post("/throw").send({
                gameId: 1, 
                userId: 1, 
                score: 5
            });

            const response = await request(app).post("/throw").send({
                gameId: 1, 
                userId: 1, 
                score: 5
            });

            await expect(response.status).toEqual(200)

            await expect(response.body).toMatchObject({
                "data":  {
                },
                "message": "Score applied to frame!",
                "status": 200
            });

            await expect(response.body.data.frame).toMatchObject({
                    "allowedAttempts": 2,
                    "attempts": 3,
                    "frameNumber": 1,
                    "gameId": 1,
                    "score": 14,
                    "userId": 1,
                    "createdAt": expect.any(String),
                    "updatedAt": expect.any(String),
            })
            
            await expect(response.body.data.game).toMatchObject({
                "id": expect.any(Number),
                "createdAt": null,
                "updatedAt": expect.any(String),
                "userId": 1,
                "runningScore": 14,
            })
            done()
        });
    });
