process.env.NODE_ENV = "test";
const sequelize = require("../database/database");
const request = require("supertest");
const app = require("../app");

describe("/throw", () => {
    beforeEach(async (done) => {
        await sequelize.query(`INSERT INTO "users" ("id", "name") VALUES (1, 'garrett')`);
        await sequelize.query(`INSERT INTO "games" ("id", "userId", "runningScore") VALUES (1, 1,0)`);
        done()
    });

    afterEach(async (done) => {
        await sequelize.query("DELETE FROM frames");
        await sequelize.query("DELETE FROM games");
        await sequelize.query("DELETE FROM users");
        done()
    });

    afterAll(async (done) => {
        await sequelize.query("DELETE FROM frames");
        await sequelize.query("DELETE FROM games");
        await sequelize.query("DELETE FROM users");
        await sequelize.close()
        done()
    });

    
    test("Only integers can be accepted as a score", async (done) => {
        let response;

        response = await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 0.10
        });

        await expect(response.statusCode).toEqual(500)
        await expect(response.body).toMatchObject({
            "message": "You submitted a score that is not an integer between 0 and 10.",
            "status": 500
        });

        response = await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: -5
        });

        await expect(response.statusCode).toEqual(500)
        await expect(response.body).toMatchObject({
            "message": "You submitted a score that is not an integer between 0 and 10.",
            "status": 500
        });

        response = await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 20
        });

        await expect(response.statusCode).toEqual(500)
        response = await expect(response.body).toMatchObject({
            "message": "You submitted a score that is not an integer between 0 and 10.",
            "status": 500
        });

        response = await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: '123123'
        });

        await expect(response.statusCode).toEqual(500)
        await expect(response.body).toMatchObject({
            "message": "You submitted a score that is not an integer between 0 and 10.",
            "status": 500
        });

        done()
    });

    test("A user should have 3 allowedAttempts if he scores a strike in the first attempt", async (done) => {
        const response = await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 10
        });
        await expect(response.body).toMatchObject({
            "data":  {
                "frame": {
                    "allowedAttempts": 3,
                    "attempts": 1,
                    "frameNumber": 1,
                    "gameId": 1,
                    "score": 10,
                    "userId": 1,
                },
                "game": {
                    "id": 1,
                    "createdAt": null,
                    "updatedAt": expect.any(String),
                    "userId": 1,
                    "runningScore": 10,
                    "completed": false
                },
            },
            "message": "Score applied to frame!",
            "status": 200
        });
        done()
    });

    test("A user should have 3 allowedAttempts if he scores a a spare", async (done) => {
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
                "allowedAttempts": 3,
                "attempts": 2,
                "frameNumber": 1,
                "gameId": 1,
                "score": 10,
                "userId": 1,
                "createdAt": expect.any(String),
                "updatedAt": expect.any(String),
        })
        
        await expect(response.body.data.game).toMatchObject({
            "id": expect.any(Number),
            "createdAt": null,
            "updatedAt": expect.any(String),
            "userId": 1,
            "runningScore": 10,
        })
        done()
    });

    test("A user should have the correct score on the first frame after scoring a spare", async (done) => {
        await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 5
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
                "frame": {
                    "allowedAttempts": 3,
                    "attempts": 3,
                    "frameNumber": 1,
                    "gameId": 1,
                    "score": 15,
                    "userId": 1,
                    "createdAt": expect.any(String),
                    "updatedAt": expect.any(String),
                },
                "game": {
                    "id": expect.any(Number),
                    "createdAt": null,
                    "updatedAt": expect.any(String),
                    "userId": 1,
                    "runningScore": 15,
                }
            },
            "message": "Score applied to frame!",
            "status": 200
        });
        done()
    });

    test("A user should have the correct score and attempts on 2 frames", async (done) => {
        await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 7
        });

        await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 2
        });

        const response = await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 5
        });

        await expect(response.status).toEqual(200)
        await expect(response.body).toMatchObject({
            "data":  {
                "frame": {
                    "allowedAttempts": 2,
                    "attempts": 1,
                    "frameNumber": 2,
                    "gameId": 1,
                    "score": 5,
                    "userId": 1,
                    "createdAt": expect.any(String),
                    "updatedAt": expect.any(String),
                },
                "game": {
                    "id": expect.any(Number),
                    "createdAt": null,
                    "updatedAt": expect.any(String),
                    "userId": 1,
                    "runningScore": 14,
                }
            },
            "message": "Score applied to frame!",
            "status": 200
        });
        done()
    });

    test("A user should have the correct score after playing an entire game", async (done) => {
        // Frame 1: 1 strike for score of 19
        let response;
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

        response = await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 5
        });

        await expect(response.body.data.frame).toMatchObject({
            "allowedAttempts": 3,
            "attempts": 3,
            "frameNumber": 1,
            "gameId": 1,
            "score": 20,
            "userId": 1,
            "createdAt": expect.any(String),
            "updatedAt": expect.any(String),
        });
        
        await expect(response.body.data.game).toMatchObject({
            "id": expect.any(Number),
            "createdAt": null,
            "updatedAt": expect.any(String),
            "userId": 1,
            "runningScore": 20,
        });
        
        // Frame 2: spare with final score of 17, running score of 37

        await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 5
        });

        await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 5
        });

        response = await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 7
        });

        await expect(response.status).toEqual(200)
        await expect(response.body.data.frame).toMatchObject({
            "allowedAttempts": 3,
            "attempts": 3,
            "frameNumber": 2,
            "gameId": 1,
            "score": 17,
            "userId": 1,
            "createdAt": expect.any(String),
            "updatedAt": expect.any(String),
        });

        await expect(response.body.data.game).toMatchObject({
            "id": expect.any(Number),
            "createdAt": null,
            "updatedAt": expect.any(String),
            "userId": 1,
            "runningScore": 37,
        });

        // Frame 3: open frame with score of 9, running score of 46

        await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 7
        });

        response = await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 2
        });

        await expect(response.body.data.frame).toMatchObject({
            "allowedAttempts": 2,
            "attempts": 2,
            "frameNumber": 3,
            "gameId": 1,
            "score": 9,
            "userId": 1,
            "createdAt": expect.any(String),
            "updatedAt": expect.any(String),
        })
        
        await expect(response.body.data.game).toMatchObject({
            "id": expect.any(Number),
            "createdAt": null,
            "updatedAt": expect.any(String),
            "userId": 1,
            "runningScore": 46,
        })


        // Frame 4: a spare then a strike, score of 20, running score of 66

        await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 7
        });

        await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 3
        });

        response = await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 10
        });

        await expect(response.body.data.frame).toMatchObject({
            "allowedAttempts": 3,
            "attempts": 3,
            "frameNumber": 4,
            "gameId": 1,
            "score": 20,
            "userId": 1,
            "createdAt": expect.any(String),
            "updatedAt": expect.any(String),
        })
        
        await expect(response.body.data.game).toMatchObject({
            "id": expect.any(Number),
            "createdAt": null,
            "updatedAt": expect.any(String),
            "userId": 1,
            "runningScore": 66,
        })

        // Frame 5: 3 strikes, score of 30, running score of 96

        await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 10
        });

        await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 10
        });

        response = await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 10
        });

        await expect(response.body.data.frame).toMatchObject({
            "allowedAttempts": 3,
            "attempts": 3,
            "frameNumber": 5,
            "gameId": 1,
            "score": 30,
            "userId": 1,
            "createdAt": expect.any(String),
            "updatedAt": expect.any(String),
        })
        
        await expect(response.body.data.game).toMatchObject({
            "id": expect.any(Number),
            "createdAt": null,
            "updatedAt": expect.any(String),
            "userId": 1,
            "runningScore": 96,
        })

        // Frame 6: 2 strikes and a 2, score of 22, running score of 118

        await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 10
        });

        await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 10
        });

        response = await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 2
        });

        await expect(response.body.data.frame).toMatchObject({
            "allowedAttempts": 3,
            "attempts": 3,
            "frameNumber": 6,
            "gameId": 1,
            "score": 22,
            "userId": 1,
            "createdAt": expect.any(String),
            "updatedAt": expect.any(String),
        })
        
        await expect(response.body.data.game).toMatchObject({
            "id": expect.any(Number),
            "createdAt": null,
            "updatedAt": expect.any(String),
            "userId": 1,
            "runningScore": 118,
        })

        // Frame 7: 1 strike, 2, and 3, score of 15, running score of 133

        await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 10
        });

        await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 2
        });

        response = await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 3
        });

        await expect(response.body.data.frame).toMatchObject({
            "allowedAttempts": 3,
            "attempts": 3,
            "frameNumber": 7,
            "gameId": 1,
            "score": 15,
            "userId": 1,
            "createdAt": expect.any(String),
            "updatedAt": expect.any(String),
        })
        
        await expect(response.body.data.game).toMatchObject({
            "id": expect.any(Number),
            "createdAt": null,
            "updatedAt": expect.any(String),
            "userId": 1,
            "runningScore": 133,
        })

        // Frame 8: 2 and 3, score of 5, running score of 138

        await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 2
        });

        response = await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 3
        });
        
        await expect(response.body.data.frame).toMatchObject({
            "allowedAttempts": 2,
            "attempts": 2,
            "frameNumber": 8,
            "gameId": 1,
            "score": 5,
            "userId": 1,
            "createdAt": expect.any(String),
            "updatedAt": expect.any(String),
        })
        
        await expect(response.body.data.game).toMatchObject({
            "id": expect.any(Number),
            "createdAt": null,
            "updatedAt": expect.any(String),
            "userId": 1,
            "runningScore": 138,
        })

        // Frame 9: spare and a 7, score of 17, running score of 155

        await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 3
        });

        await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 7
        });

        response = await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 7
        });

        await expect(response.body.data.frame).toMatchObject({
            "allowedAttempts": 3,
            "attempts": 3,
            "frameNumber": 9,
            "gameId": 1,
            "score": 17,
            "userId": 1,
            "createdAt": expect.any(String),
            "updatedAt": expect.any(String),
        })

        await expect(response.body.data.game).toMatchObject({
            "id": expect.any(Number),
            "createdAt": null,
            "updatedAt": expect.any(String),
            "userId": 1,
            "runningScore": 155,
        })

        // Frame 10: spare and a 3, score of 13, running score of 168

        await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 1
        });

        await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 9
        });

        response = await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 3
        });

        await expect(response.body.data.frame).toMatchObject({
            "allowedAttempts": 3,
            "attempts": 3,
            "frameNumber": 10,
            "gameId": 1,
            "score": 13,
            "userId": 1,
            "createdAt": expect.any(String),
            "updatedAt": expect.any(String),
        })

        await expect(response.body.data.game).toMatchObject({
            "id": expect.any(Number),
            "createdAt": null,
            "updatedAt": expect.any(String),
            "userId": 1,
            "runningScore": 168,
        })

        response = await request(app).post("/throw").send({
            gameId: 1, 
            userId: 1, 
            score: 10
        });
        console.log('esp', response.body)
        await expect(response.statusCode).toEqual(500)
        await expect(response.body.message).toEqual("You have already played the final frame for this game! Create a new game to play again.")

        done()
    });
});
