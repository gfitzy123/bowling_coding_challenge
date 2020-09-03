const database = require("../database/database");

const isNormalInteger = (str) => {
  var n = Math.floor(Number(str));
  return n !== Infinity && String(n) === str && n >= 0;
};

const isValidInput = (input) => {
  if (input < 0 || input > 10) {
    return false;
  }

  // When input is a string that is not an integer
  else if (typeof input === "string" && !utils.isNormalInteger(input)) {
    return false;
  }

  // And finally, if a number is not an integer
  else if (!Number.isInteger(input)) {
    return false;
  } else return true;
};

const getSum = (total, score) => {
  return total + Math.round(score.score_sum);
};

const checkIfLastGame = async (gameId, userId) => {
  const lastFrameAndScore = await database.query(
    `SELECT s.frame_id, s.attempt, f.frame_number, s.score FROM frames as f INNER JOIN scores as s on s.frame_id = f.id where f.game_id=${gameId} and s.user_id=${userId} and f.frame_number=10`
  );
  const totalScore = lastFrameAndScore[0].reduce(function (sum, score) {
    return sum + score;
  }, 0);
  const lastAttempt = Math.max(
    ...lastFrameAndScore[0].map((row) => row.attempt)
  );

  if (lastAttempt === 3) {
    return true;
  }

  if (lastAttempt < 2) {
    return false;
  }

  if (totalScore >= 10 && lastAttempt === 2) {
    return false;
  }
  return false;
};

module.exports.checkIfLastGame = checkIfLastGame;
module.exports.getSum = getSum;
module.exports.isValidInput = isValidInput;
module.exports.isNormalInteger = isNormalInteger;
