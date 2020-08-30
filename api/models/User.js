const Sequelize = require('sequelize');
const sequelize = require('../../database/database.js');

const tableName = 'users';

const User = sequelize.define('User', {
  name: {
    type: Sequelize.STRING,
    unique: true,
  },
  createdAt: {
    type: Sequelize.DATE,
  },
}, { tableName });

// eslint-disable-next-line
User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  return values;
};

module.exports = User;
