const Sequelize = require("sequelize");
const sequelize = require("../../database/database.js");

const tableName = "games";

const Game = sequelize.define(
  "Game",
  {
    userId: {
      type: Sequelize.INTEGER,
      unique: true,
    },
    runningScore: {
      type: Sequelize.INTEGER,
    },
    completed: {
      type: Sequelize.BOOLEAN,
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
Game.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  return values;
};

module.exports = Game;
