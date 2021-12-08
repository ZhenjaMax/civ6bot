import {Sequelize} from "sequelize";

export const database = new Sequelize(
    "db",
    "root",
    "password",
    {
        host: "localhost",
        logging: false,
        dialect: "sqlite",
        storage: './db.sqlite',
    }
);
