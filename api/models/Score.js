const Sequelize = require("sequelize");
const sequelize = require("../../database/database.js");

const tableName = "scores";

const Score = sequelize.define(
  "Score",
  {
    user_id: {
      type: Sequelize.INTEGER,
      unique: true,
    },
    score: {
      type: Sequelize.INTEGER,
    },
    attempt: {
      type: Sequelize.INTEGER,
    },
    frame_id: {
      type: Sequelize.INTEGER,
    },
    game_id: {
      type: Sequelize.INTEGER,
    },
    user_id: {
      type: Sequelize.INTEGER,
    },
    createdAt: {
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE,
    },
  },
  { tableName }
);

// eslint-disable-next-line
Score.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  return values;
};

module.exports = Score;
