var express = require('express');
var router = express.Router();
const Game = require('../api/models/Game');

/* GET game */
router.get('/:id', async function(req, res) {
  const game = await Game.findOne({ id: req.query.id});
  const response = {
    status: 200, 
    message: 'Game succesfully fetched.',
    data: game
    }
  res.status(200).send(response)
});

/* GET all games. */
router.get('/', async function(res) {
  const games = await Game.findAll();
  const response = {
    status: 200, 
        message: 'Games succesfully fetched.',
        data: games
    }
  res.status(200).send(response)
});

/* POST to create game. */
router.post('/', async function(req, res) {
  if (req.body.userId){
    let game = await Game.create({ 
        userId: req.body.userId,
        runningScore: 0
    });
    const response = {
      status: 200, 
        message: 'Game created!',
        data: game
    }
    res.status(200).send(response)
  } else {
    const response = {
      status: 500, 
        message: 'A "userId" field is required to create a game.',
        data: null
    }
    res.status(500).send(response)
  }
});

/* DELETE game. */
router.delete('/:id', async function(req, res) {
  if (req.query.id){
    const game = await Game.delete({ id: req.query.id});
    const response = {
      status: 200, 
        message: 'Games succesfully deleted.',
        data: game
    }
    res.status(200).send(response)
  } else {
    const response = {
      status: 500, 
        message: 'A "name" field required in update name field in user table',
        data: null
    }
    res.status(500).send(response)
  }
});


module.exports = router;
