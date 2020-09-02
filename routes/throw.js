var express = require("express");
var router = express.Router();
const Game = require("../api/models/Game");
const Frame = require("../api/models/Frame");
const sequelize = require("sequelize");
const utils = require("../utils/utils");
const Score = require("../api/models/Score");

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
        userId,
      },
      order: sequelize.literal('"Frame"."frameNumber" DESC'),
    });
    console.log("currentFrames", currentFrames);

    let response;

    // If no frames exist, create a new frame and update the score.
    // If frames do exist, then perform some additional scoring logic.

    if (!currentFrames.length) {
      console.log("First frame");
      let newFrame = {
        frameNumber: 1,
        allowedAttempts: 2,
        userId,
        gameId,
      };

      if (newScore === 10) {
        newFrame.allowedAttempts = 3;
      }
      console.log(newFrame);
      const firstFrame = await Frame.create(newFrame).catch((e) =>
        console.log("e", e)
      );
      console.log("firstFrame", firstFrame.dataValues);
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
      const frameId = latestFrame.id;
      const currentAttempts = latestFrame.dataValues.attempts;
      const currentAllowedAttempts = latestFrame.dataValues.allowedAttempts;

      const previousScore = await Score.findAll({
        where: {
          gameId,
          userId,
          frameId,
        },
        order: sequelize.literal('"Score"."attempt" DESC'),
      })[0];

      console.log("previosuScore", previousScore);

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

      // create new score

      const newScore = await Score.create({
        score: newScore + previousScore,
        attempt: newAttempts,
        userId,
        gameId,
        frameId,
      });

      // Upate the current frame with new score and attempts

      const updatedFrame = await Frame.update(
        {
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
    console.log("catch e", e);
    const response = {
      status: 500,
      message: JSON.stringify(e),
    };
    res.status(500).send(response);
  }
});

module.exports = router;
