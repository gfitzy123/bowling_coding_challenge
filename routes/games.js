var express = require("express");
var router = express.Router();
const Game = require("../api/models/Game");
const Frame = require("../api/models/Frame");

/* GET game */
router.get("/:id", async function (req, res) {
  const game = await Game.findOne({ id: req.query.id });
  const response = {
    status: 200,
    message: "Game succesfully fetched.",
    data: game,
  };
  res.status(200).send(response);
});

/* GET all games. */
router.get("/", async function (res) {
  const games = await Game.findAll();
  const response = {
    status: 200,
    message: "Games succesfully fetched.",
    data: games,
  };
  res.status(200).send(response);
});

/* POST to create game. */
router.post("/", async function (req, res) {
  let game = await Game.create({});
  const frames = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  frames.map((number) => {
    Frame.create({
      frameNumber: number,
      gameId: game.dataValues.id,
    });
  });
  const response = {
    status: 200,
    message:
      "Game created! Use the returned game id and your user id to hit the /throw route to start playing.",
    data: game,
  };
  res.status(200).send(response);
});

/* DELETE game. */
router.delete("/:id", async function (req, res) {
  if (req.query.id) {
    const game = await Game.delete({ id: req.query.id });
    const response = {
      status: 200,
      message: "Games succesfully deleted.",
      data: game,
    };
    res.status(200).send(response);
  } else {
    const response = {
      status: 500,
      message: 'A "name" field required in update name field in user table',
      data: null,
    };
    res.status(500).send(response);
  }
});

module.exports = router;
