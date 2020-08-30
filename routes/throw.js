var express = require("express");
var router = express.Router();
const Game = require("../api/models/Game");
const Frame = require("../api/models/Frame");
const sequelize = require("sequelize");
const utils = require("../utils/utils");

/* POST to throw a bowling ball in a game. */
router.post("/", async function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  let newScore = req.body.score;

  // Catching edge cases here. Starting with numbers completely out of range.
  if (newScore < 0 || newScore > 10) {
    res.status(500).send({
      status: 500,
      message: "You submitted a score that is not an integer between 0 and 10.",
    });
    return;
  }

  // When input is a string that is not an integer
  if (typeof newScore === "string" && !utils.isNormalInteger(newScore)) {
    res.status(500).send({
      status: 500,
      message: "You submitted a score that is not an integer between 0 and 10.",
    });
    return;
  }

  // And finally, if a number is not an integer
  if (!Number.isInteger(newScore)) {
    res.status(500).send({
      status: 500,
      message: "You submitted a score that is not an integer between 0 and 10.",
    });
    return;
  }

  try {
    const gameId = req.body.gameId;
    const userId = req.body.userId;

    // Grab the current game.
    const currentGame = await Game.findOne({
      where: {
        id: gameId,
        userId,
      },
    });

    // Catch the case where final frame has been already been played by player
    if (currentGame.dataValues.completed) {
      const response = {
        status: 500,
        message:
          "You have already played the final frame for this game! Create a new game to play again.",
      };
      res.status(500).send(response);
      return;
    }

    // Grab all the frames for the given user and game.
    const currentFrames = await Frame.findAll({
      where: {
        gameId,
        userId,
      },
      order: sequelize.literal('"Frame"."frameNumber" DESC'),
    });

    const latestFrame = currentFrames[0];

    let response;

    // If no frames exist, create a new frame and update the score.
    // If frames do exist, then perform some additional scoring logic.

    if (!currentFrames.length) {
      const updatedGame = await Game.update(
        {
          runningScore: currentGame.runningScore + newScore,
        },
        {
          where: {
            id: gameId,
            userId,
          },
          returning: true,
          plain: true,
        }
      );

      let newFrame = {
        frameNumber: 1,
        attempts: 1,
        allowedAttempts: 2,
        score: newScore,
        userId,
        gameId,
      };

      if (newScore === 10) {
        newFrame.allowedAttempts = 3;
      }

      const firstFrame = await Frame.create(newFrame);

      response = {
        status: 200,
        message: "Score applied to frame!",
        data: {
          frame: firstFrame,
          game: updatedGame[1],
        },
      };
    } else {
      const currentAttempts = latestFrame.dataValues.attempts;
      const currentAllowedAttempts = latestFrame.dataValues.allowedAttempts;
      const previousScore = latestFrame.dataValues.score;
      let newAttempts = null;
      let newAllowedAttempts = currentAllowedAttempts;

      // if a strike, increase allowed attempts by 1
      if (newScore === 10 && currentAttempts === 0) {
        newAllowedAttempts = 3;
      }

      // if a spare, increase allowed attempts by 1
      if (previousScore + newScore === 10 && currentAttempts === 1) {
        newAllowedAttempts = newAllowedAttempts + 1;
      }

      // increase attempt number
      newAttempts = currentAttempts + 1;

      // Upate the current frame with new score and attempts

      const updatedFrame = await Frame.update(
        {
          score: newScore + previousScore,
          attempts: newAttempts,
          allowedAttempts: newAllowedAttempts,
        },
        {
          where: {
            id: latestFrame.dataValues.id,
          },
          returning: true,
          plain: true,
        }
      );

      // Perform a check if this is a completed game, and update the game as necessary.

      const isGameComplete =
        currentFrames.length === 10 && newAttempts === newAllowedAttempts;

      const updatedGame = await Game.update(
        {
          runningScore: currentGame.runningScore + newScore,
          completed: isGameComplete,
        },
        {
          where: {
            id: gameId,
            userId,
          },
          returning: true,
          plain: true,
        }
      );

      // If this is the players final attempt, create the next frame.
      if (newAttempts === newAllowedAttempts) {
        await Frame.create({
          frameNumber: latestFrame.dataValues.frameNumber + 1,
          userId,
          gameId,
        });
      }

      response = {
        status: 200,
        message: "Score applied to frame!",
        data: {
          frame: updatedFrame[1],
          game: updatedGame[1],
        },
      };
    }

    res.status(200).send(response);
  } catch (e) {
    const response = {
      status: 500,
      message: JSON.stringify(e),
    };
    res.status(500).send(response);
  }
});

module.exports = router;
