var express = require("express");
var router = express.Router();
const Game = require("../api/models/Game");
const Frame = require("../api/models/Frame");
const sequelize = require("sequelize");
const utils = require("../utils/utils");
const Score = require("../api/models/Score");
const reduce = require("lodash/reduce");

/* POST to throw a bowling ball in a game. */
router.post("/", async function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  let newScore = req.body.score;

  // Catching edge cases here. Starting with numbers completely out of range.
  if (!utils.isValidInput(newScore)) {
    res.status(500).send({
      status: 500,
      message: "You submitted a score that is not an integer between 0 and 10.",
    });
    return;
  }

  try {
    const gameId = req.body.gameId;
    const userId = req.body.userId;

    // Grab all the frames for the given user and game.

    const currentFrames = await Frame.findAll({
      where: {
        gameId,
      },
      order: sequelize.literal('"Frame"."frameNumber" DESC'),
    });

    let response;

    // If no frames exist, create a new frame and update the score.
    // If frames do exist, then perform some additional scoring logic.

    if (!currentFrames.length) {
      console.log("First frame");
      let newFrame = {
        frameNumber: 1,
        gameId,
      };

      if (newScore === 10) {
        newFrame.allowedAttempts = 3;
      }

      const firstFrame = await Frame.create(newFrame);

      await Score.create({
        score: newScore,
        attempt: 1,
        userId,
        gameId,
        frameId: firstFrame.dataValues.id,
      }).catch((e) => console.log("e2", e));

      response = {
        status: 200,
        message: "Score applied to frame!",
        data: {
          frame: firstFrame,
          game: {
            id: gameId,
            yourRunningTotal: newScore,
          },
        },
      };
    } else {
      console.log("inside");
      // Perform a check if this is a completed game, and update the game as necessary.
      // We check allowedAttempts on the frame with the user with the sum of all scores that exist for that frame.
      if (currentFrames.length === 10) {
        const scoreCount = Score.findAll({
          where: {
            gameId,
            userId,
            frameId,
          },
          attributes: [
            "Score.*",
            [sequelize.fn("COUNT", "Score.id"), "scoreCount"],
          ],
          // include: [Post]
        });
        console.log("scoreCount");

        if (scoreCount.dataValues.scoreCount === latestFrame.allowedAttempts) {
          //Game is complete
          console.log("Game is complete");
          return;
        }
      }

      const latestFrame = currentFrames[0];
      // case when other player creates frame, and the other user did not finish his
      // get scores for last two frames
      // see if they all match up

      const frameId = latestFrame.dataValues.id;
      console.log(frameId, gameId, userId);
      const previousScores = await Score.findAll({
        where: {
          gameId,
          userId,
          frameId,
        },
        order: sequelize.literal('"Score"."attempt" ASC'),
      });

      console.log("previosuScore", previousScores.length);

      // if first frame, create ten
      // score first frame

      // next score
      // check if frames exist
      // retrieve

      // Using previous scores, check if the user is able to submit anyother one
      let isUserAbleToAttemptAgain = false;

      if (previousScores.length === 2) {
        // check if scores suggest an additional attempt is allowed
        if (previousScores[0] === 10) {
          isUserAbleToAttemptAgain = true;
        } else if (previousScores[0] + previousScores[1] === 10) {
          isUserAbleToAttemptAgain = true;
        }
      } else if (previousScores.length === 1) {
        isUserAbleToAttemptAgain = true;
      }

      const runningTotal = previousScores.reduce(utils.getSum, 0);

      if (
        isUserAbleToAttemptAgain &&
        (previousScores.length === 1 || previousScores === 2)
      ) {
        await Score.create({
          score: newScore,
          attempt: previousScores.length + 1,
          userId,
          gameId,
          frameId,
        });
        response = {
          status: 200,
          message: "Score applied to frame!",
          data: {
            frame: latestFrame,
            game: {
              gameId,
              yourRunningTotal: runningTotal + newScore,
            },
          },
        };
        res.status(200).send(response);
      } else if (isUserAbleToAttemptAgain && previousScores.length == 3) {
        const newFrame = await Frame.create({
          frameNumber: latestFrame.dataValues.frameNumber + 1,
          gameId,
        });

        const newScore = await Score.create({
          score: newScore,
          attempt: 1,
          userId,
          gameId,
          frameId: newFrame.dataValues.frameId,
        });

        response = {
          status: 200,
          message: "Score applied to frame!",
          data: {
            frame: newFrame,
            game: {
              gameId,
              yourRunningTotal: runningTotal + newScore,
            },
          },
        };

        res.status(200).send(response);
      }
    }
  } catch (e) {
    console.log("catch e", e);
    const response = {
      status: 500,
      message: JSON.stringify(e),
    };
    res.status(500).send(response);
  }
});

module.exports = router;
