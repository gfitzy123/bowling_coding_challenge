var express = require('express');
var router = express.Router();
const Game = require('../api/models/Game');
const Frame = require('../api/models/Frame');
const User = require('../api/models/User');
const sequelize = require('sequelize');

/* POST to throw a bowling ball in a game. */
router.post('/', async function(req, res) {
    // Pick a random number between 0 and 10.
    const gameId = req.body.gameId;
    const userId = req.body.userId;
    let newScore = req.body.score;

    // allow ability to randomly throw and also to specify a number

    if (!score){
        newScore = Math.floor(Math.random() * 10) + 1;
    }

    console.log('Threw a ', newScore)
    // Update running score for user's game.
    const currentGame = await Game.findOne({id: gameId})
    // console.log('currentGame', currentGame)
    const updatedGame = await Game.update({
         runningScore: currentGame.runningScore + newScore
    }, {
        where: {
            id: gameId,
            userId
        }
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

    if (!currentFrames.length){
        firstFrame = await Frame.create({
            frameNumber: 1,
            attempts: 1,
            newScore,
            userId,
            gameId
        })
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

        await Game.update({
            runningScore: currentGame.runningScore + score
        }, {
           where: {
               id: gameId,
               userId
           }
       });

       await Frame.update({
            score: newScore,
            attempts: newAttempts, 
            allowedAttempts: newAllowedAttempts
       }, {
           where: {
               id: latestFrame.dataValues.id,
           }
       });

    }
    console.log('Created new frame', firstFrame)
});

module.exports = router;
