var express = require("express");
var router = express.Router();
const Game = require("../api/models/Game");
const Frame = require("../api/models/Frame");
const database = require("../database/database");
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
    let response;
    console.log("userId", userId);
    const frames = await database.query(
      `select f.frame_number, sum(s.score) as score_sum, s.user_id, f.id from frames as f inner join scores as s ON s.frame_id = f.id where f.game_id=${gameId} and s.user_id=${userId} group by (f.id, s.user_id, f.frame_number) order by f.frame_number desc`
    );
    console.log("frames", frames);

    let currentFrameIndex = 0;

    const latestFrameWithScore = frames[0].find((frame, i) => {
      console.log("i", i);
      if (parseInt(frame.score_sum) > 0) {
        currentFrameIndex = i;
        return frame;
      } else if (i === 9) {
        return frame;
      }
    });

    console.log("latestFrameWithScore", latestFrameWithScore);
    if (!latestFrameWithScore) {
      // user has no more attempts and has completed frame
      // use next frame to score
      const firstFrame = await Frame.findOne({
        where: {
          game_id: gameId,
          frame_number: 1,
        },
      });
      console.log("firstFrame", firstFrame);
      await Score.create({
        score: newScore,
        attempt: 1,
        user_id: userId,
        game_id: gameId,
        frame_id: firstFrame.id,
      });

      response = {
        status: 200,
        message: "Score applied to frame!",
        data: {
          frame: firstFrame,
          game: {
            gameId,
            yourRunningTotal: newScore,
          },
        },
      };
      res.status(200).send(response);
      return;
    }
    // create all 10 frames
    // when user throws
    // find last frame user has scored on
    // return all scores for all frames, assorted by frame number
    // if no scores, score begins at one

    // if there are scores

    // check if user has any allowable attempts left
    // if he does, score current frame
    // if not, score next frame

    const totalScore = parseInt(latestFrameWithScore.score_sum);
    const frameId = latestFrameWithScore.id;
    console.log("frameId", frameId);
    const attemptCountResult = await database.query(
      `SELECT COUNT(id) FROM scores where frame_id=${frameId} GROUP BY frame_id`
    );
    const runningTotal = frames.reduce(utils.getSum, 0);
    const attemptCount = parseInt(attemptCountResult[0][0].count);
    console.log("at", typeof attemptCount);
    console.log("attempts", attemptCount);

    if (attemptCount === 1) {
      // user is on second attempt
      // use next frame to score
      console.log("???", userId, gameId);
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
            gameId,
            yourRunningTotal: runningTotal + newScore,
          },
        },
      };
    }
    console.log("totalScore + newScore", totalScore + newScore);
    if (attemptCount === 2) {
      // find out if user will get one more attempt
      if (totalScore + newScore >= 10) {
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
              gameId,
              yourRunningTotal: runningTotal + newScore,
            },
          },
        };
        res.status(200).send(response);
        return;
      } else if (totalScore + newScore < 10) {
        // user has no more attempts and has completed frame
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
            frame: { ...nextFrame, score: totalScore + newScore },
            game: {
              gameId,
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
      console.log(
        "latestFrameWithScore.frame_number",
        latestFrameWithScore.frame_number
      );
      console.log("frameslength", frames.length);
      // console.log()
      const nextFrame = await Frame.findOne({
        where: {
          frame_number: parseInt(latestFrameWithScore.frame_number) + 1,
          game_id: gameId,
        },
      });
      console.log("nextFrameId", nextFrame);
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
            gameId,
            yourRunningTotal: runningTotal + newScore,
          },
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
