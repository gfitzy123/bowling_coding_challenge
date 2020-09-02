const Sequelize = require("sequelize");
const sequelize = require("../../database/database.js");

const tableName = "frames";

const Frame = sequelize.define(
  "Frame",
  {
    game_id: {
      type: Sequelize.INTEGER,
    },
    frame_number: {
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
Frame.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  return values;
};

module.exports = Frame;
