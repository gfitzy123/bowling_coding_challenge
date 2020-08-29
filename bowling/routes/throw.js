var express = require('express');
var router = express.Router();
const Game = require('../api/models/Game');
const Frame = require('../api/models/Frame');
const User = require('../api/models/User');
const sequelize = require('sequelize');

/* POST to throw a bowling ball in a game. */
router.post('/', async function(req, res) {
    try {
        res.setHeader('Content-Type', 'application/json');
        // Pick a random number between 0 and 10.
        const gameId = req.body.gameId;
        const userId = req.body.userId;
        let newScore = req.body.score;

        // allow ability to randomly throw and also to specify a number
console.log('newScore', newScore)
        if (!newScore){
            newScore = Math.floor(Math.random() * 10) + 1;
        }

        console.log('Threw a ', newScore)
        // Update running score for user's game.
        const currentGame = await Game.findOne({
            where: {
                id: gameId,
                userId
            }
        })
        // console.log('currentGame', currentGame)
        const updatedGame = await Game.update({
            runningScore: currentGame.runningScore + newScore
        }, {
            where: {
                id: gameId,
                userId
            },
            returning: true,
            plain: true,
        });

        console.log('updatedGame', updatedGame)
        // If frame exists, update frame score. If not, create new frame with beginning score.

        const currentFrames = await Frame.findAll({
            where: {
                id: gameId,
                userId
            },
            order: sequelize.literal('"Frame"."frameNumber" DESC')
        });

        // console.log('currentFrame', currentFrame)
        let response;

        if (!currentFrames.length){
            let newFrame = {
                frameNumber: 1,
                attempts: 1,
                allowedAttempts: 2,
                newScore,
                userId,
                gameId
            }

            if (newScore === 10){
                newFrame.allowedAttempts = 3
                firstFrame = await Frame.create(newFrame)
            } else {
                firstFrame = await Frame.create(newFrame)
            }

            response = {
                status: 200, 
                message: 'Score applied to frame!',
                data: {
                    frame: firstFrame,
                    game: updatedGame
                }
            }
        } else {
            // Grab lastest frame 
            const latestFrame = currentFrames[0]
            // console.log('latestFrame', latestFrame)
            
            // a strike
            const previousScore = latestFrame.dataValues.score
            const currentAttemptNumber = latestFrame.dataValues.attempts
            const currentAllowedAttempts = latestFrame.dataValues.allowedAttempts
            
            let newScore = 0;
            let newAttempts = null;
            let newAllowedAttempts = null;

            if ((newScore === 10 && allowedAttempts === 2) || (previousScore + newScore === 10 && currentAttemptNumber === 1)){
                newAllowedAttempts = currentAttemptNumber + 1
            } else {
                newAttempts = currentAllowedAttempts + 1
            }

            if (currentAttemptNumber + 1 === 4){
                // check for attempt 3 case
                // create new frame, so next time player throws, it will update next frame
                    await Frame.create({
                        frameNumber: latestFrame.dataValues.frameNumber++,
                        userId,
                        gameId
                });
            }
            
            // always increase attempt number
            newAttempts = lastAttemptNumber + 1

            const updatedFrame = await Frame.update({
                score: newScore,
                attempts: newAttempts, 
                allowedAttempts: newAllowedAttempts
            }, {
                where: {
                    id: latestFrame.dataValues.id,
                },
                returning: true,
                plain: true
            });

            response = {
                status: 200, 
                message: 'Score applied to frame!',
                data: {
                    frame: updatedFrame,
                    game: updatedGame
                }
            }
        }

        res.status(200).send(response)

    } catch(e) {
        const response = {
            status: 500,
            message: "An error occured on the server."
        }
    }
});

module.exports = router;
