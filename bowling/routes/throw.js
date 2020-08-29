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

        // console.log('updatedGame', updatedGame)
        // If frame exists, update frame score. If not, create new frame with beginning score.

        const currentFrames = await Frame.findAll({
            where: {
                gameId,
                userId
            },
            order: sequelize.literal('"Frame"."frameNumber" DESC')
        });

        // console.log('currentFrame', currentFrame)
        let response;
console.log('currentFrames', currentFrames.length)
        if (!currentFrames.length){
            let newFrame = {
                frameNumber: 1,
                attempts: 1,
                allowedAttempts: 2,
                score: newScore,
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
                    frame: firstFrame[1],
                    game: updatedGame[1]
                }
            }
        } else {
            // Grab lastest frame 
            
            const latestFrame = currentFrames[0]
            console.log('latestFrame', latestFrame)
            
            // a strike
            const previousScore = latestFrame.dataValues.score
            const currentAttempts = latestFrame.dataValues.attempts
            const currentAllowedAttempts = latestFrame.dataValues.allowedAttempts
            console.log('previousScore', previousScore)
            console.log('currentAttempts', currentAttempts)
            console.log('currentAllowedAttempts', currentAllowedAttempts)

            let newAttempts = null;
            let newAllowedAttempts = currentAllowedAttempts;

            if ((newScore === 10 && currentAttempts === 1) || (previousScore + newScore === 10 && currentAttempts + 1 === 2)){
                newAllowedAttempts++
            } 
console.log('here')
            if (currentAttempts + 1 === 4){
                console.log('creating new frame')
                // check for attempt 3 case
                // create new frame, so next time player throws, it will update next frame
                await Frame.create({
                    frameNumber: latestFrame.dataValues.frameNumber++,
                    userId,
                    gameId
                });
            }
            
            // always increase attempt number
            newAttempts = currentAttempts + 1
console.log('before')
            const updatedFrame = await Frame.update({
                score: newScore + previousScore,
                attempts: newAttempts, 
                allowedAttempts: newAllowedAttempts 
            }, {
                where: {
                    id: latestFrame.dataValues.id,
                },
                returning: true,
                plain: true
            });
console.log('updatedFrame')
            response = {
                status: 200, 
                message: 'Score applied to frame!',
                data: {
                    frame: updatedFrame[1],
                    game: updatedGame[1]
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
