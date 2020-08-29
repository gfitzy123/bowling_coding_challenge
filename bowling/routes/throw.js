var express = require('express');
var router = express.Router();
const Games = require('../api/models/Game');
const Frame = require('../api/models/Frame');
const User = require('../api/models/User');

/* POST to throw a bowling ball in a game. */
router.post('/throw/:userId/:gameId', async function(req, res) {
    // Pick a random number between 0 and 10.
    const score = Math.floor(Math.random() * 10) + 1;
    const gameId = req.query.gameId;
    const userId = req.query.userId;

    console.log('Threw a ', score)
    // Update running score for user's game.
    const currentGame = await Game.findOne({id: gameId})
    const updatedGame = await Game.update({
         runningScore: currentGame.runningScore + score
    }, {
        where: {
            id: gameId,
            userId
        }
    });

    // If frame exists, update frame score. If not, create new frame with beginning score.

    const currentFrame = await Frame.findAll({
        where: {
            id: gameId,
            userId
        },
        order: ['frameNumber', 'DESC'],
    });

    console.log('currentFrame', currentFrame)
    let firstFrame
    if (!currentFrame.length){
        firstFrame = await Frame.create({
            frameNumber: 1,
            attempts: 1,
            score,
            userId,
            gameId
        })
    }
    console.log('Created new frame', firstFrame)
});

module.exports = router;
