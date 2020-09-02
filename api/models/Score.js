const Sequelize = require("sequelize");
const sequelize = require("../../database/database.js");

const tableName = "scores";

const Score = sequelize.define(
  "Score",
  {
    userId: {
      type: Sequelize.INTEGER,
      unique: true,
    },
    score: {
      type: Sequelize.INTEGER,
    },
    attempt: {
      type: Sequelize.INTEGER,
    },
    frameId: {
      type: Sequelize.INTEGER,
    },
    gameId: {
      type: Sequelize.INTEGER,
    },
    userId: {
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
