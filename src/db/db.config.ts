import {Options} from "sequelize";

export class DbConfig{
    database: string = "db";
    username: string = "root";
    password: string = "password";
    options: Options = {
        host: "localhost",
        logging: false,
        dialect: "sqlite",
        storage: './db.sqlite',
    };
}
