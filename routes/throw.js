var express = require("express");
var router = express.Router();
const Frame = require("../api/models/Frame");
const database = require("../database/database");
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
    // when user throws
    // find last frame user has scored on
    // return all scores for all frames, assorted by frame number
    // if no scores, score begins at one

    // if there are scores
    // check if user has any allowable attempts left
    // if he does, score current frame
    // if not, score next frame

    const gameId = req.body.gameId;
    const userId = req.body.userId;
    let response;
    const frames = await database.query(
      `select f.frame_number, sum(s.score) as score_sum, s.user_id, f.game_id, f.id from frames as f inner join scores as s ON s.frame_id = f.id where f.game_id=${gameId} and s.user_id=${userId} group by (f.id, s.user_id, f.frame_number, f.game_id) order by f.frame_number desc`
    );

    // check if last game
    const isLastGame = await utils.checkIfLastGame(gameId, userId);

    if (isLastGame) {
      res.status(500).send({
        message:
          "You have already played the final frame for this game! Create a new game to play again.",
      });
      return;
    }

    const latestFrameWithScore = frames[0].find((frame, i) => {
      if (parseInt(frame.score_sum) > 0) {
        currentFrameIndex = i;
        return frame;
      } else if (i === 9) {
        return frame;
      }
    });

    if (!latestFrameWithScore) {
      // user has no more attempts and has completed frame
      // use next frame to score
      const firstFrame = await Frame.findOne({
        where: {
          game_id: gameId,
          frame_number: 1,
        },
      });
      await Score.create({
        score: newScore,
        attempt: 1,
        user_id: userId,
        game_id: gameId,
        frame_id: firstFrame.dataValues.id,
      });

      response = {
        status: 200,
        message: "Score applied to frame!",
        data: {
          frame: firstFrame,
          game: {
            game_id: gameId,
            yourRunningTotal: newScore,
          },
        },
      };
      res.status(200).send(response);
      return;
    }

    const totalScore = parseInt(latestFrameWithScore.score_sum);
    const frameId = latestFrameWithScore.id;
    const attemptCountResult = await database.query(
      `SELECT COUNT(id) FROM scores where frame_id=${frameId} GROUP BY frame_id`
    );
    const runningTotal = frames[0].reduce(utils.getSum, 0);
    const attemptCount = parseInt(attemptCountResult[0][0].count);

    if (attemptCount === 1) {
      // user is on second attempt
      // use next frame to score
      await Score.create({
        score: newScore,
        attempt: 2,
        user_id: userId,
        game_id: gameId,
        frame_id: latestFrameWithScore.id,
      });

      response = {
        status: 200,
        message: "Score applied to frame!",
        data: {
          frame: { ...latestFrameWithScore, score: newScore },
          game: {
            game_id: gameId,
            yourRunningTotal: runningTotal + newScore,
          },
        },
      };
    }
    // users third attempt
    if (attemptCount === 2) {
      // find out if user will get one more attempt
      if (totalScore >= 10) {
        // user has one more attempt
        // use current frame to score
        await Score.create({
          score: newScore,
          attempt: 3,
          user_id: userId,
          game_id: gameId,
          frame_id: frameId,
        });

        response = {
          status: 200,
          message: "Score applied to frame!",
          data: {
            frame: latestFrameWithScore,
            game: {
              game_id: gameId,
              yourRunningTotal: runningTotal + newScore,
            },
          },
        };
        res.status(200).send(response);
        return;
      } else if (totalScore < 10) {
        // user has no more attempts and has completed frame
        // use next frame to score
        const nextFrame = await Frame.findOne({
          where: {
            frame_number: parseInt(latestFrameWithScore.frame_number) + 1,
            game_id: gameId,
          },
          raw: true,
        });
        await Score.create({
          score: newScore,
          attempt: 1,
          user_id: userId,
          game_id: gameId,
          frame_id: nextFrame.id,
        });
        response = {
          status: 200,
          message: "Score applied to frame!",
          data: {
            frame: { ...nextFrame, score: totalScore + newScore },
            game: {
              game_id: gameId,
              yourRunningTotal: runningTotal + newScore,
            },
          },
        };
        res.status(200).send(response);
        return;
      }
    }

    if (attemptCount === 3) {
      // user has completed last frame
      // use next frame to score
      const nextFrame = await Frame.findOne({
        where: {
          frame_number: parseInt(latestFrameWithScore.frame_number) + 1,
          game_id: gameId,
        },
      });

      await Score.create({
        score: newScore,
        attempt: 1,
        user_id: userId,
        game_id: gameId,
        frame_id: nextFrame.dataValues.id,
      });

      response = {
        status: 200,
        message: "Score applied to frame!",
        data: {
          frame: { ...nextFrame, score: newScore },
          game: {
            game_id: gameId,
            yourRunningTotal: runningTotal + newScore,
          },
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
