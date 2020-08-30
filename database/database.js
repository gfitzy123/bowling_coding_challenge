const Sequelize = require('sequelize');

const db = process.env.NODE_ENV === "test" ? "bowling_test" : "bowling";

const connection = {
    database: db,
    username: 'postgres',
    password: 'postgres',
    host: 'localhost',
    dialect: 'postgres',
};

let database;

database = new Sequelize(
    connection.database,
    connection.username,
    connection.password, {
    host: connection.host,
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
    dialect: 'postgres',
    },
);


module.exports = database;
