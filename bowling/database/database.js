const Sequelize = require('sequelize');

const db = process.env.NODE_ENV === "test" ? "bowling-test" : "bowling";

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
    //storage: path.join(process.cwd(), 'db', 'database.postgres'),
    },
);


module.exports = database;
