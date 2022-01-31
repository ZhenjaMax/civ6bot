import {Sequelize} from "sequelize";
import {DbConfig} from "./db.config";
import {UserProfile, UserProfileModel} from "./models/db.UserProfile"
import {UserSteam, UserSteamModel} from "./models/db.UserSteam";
import {UserRating, UserRatingModel} from "./models/db.UserRating";
import {UserPunishment, UserPunishmentModel} from "./models/db.UserPunishment";
import {RatingNote, RatingNoteModel} from "./models/db.RatingNote";
import {UserTimings, UserTimingsModel} from "./models/db.UserTimings";
import {GuildConfig, GuildConfigModel} from "./models/db.GuildConfig";

export async function dbInitialize(){
    let dbConfig: DbConfig = new DbConfig();
    const database = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig.options);

    UserProfile.init(UserProfileModel, {sequelize: database});
    UserSteam.init(UserSteamModel, {sequelize: database});
    UserRating.init(UserRatingModel, {sequelize: database});
    UserPunishment.init(UserPunishmentModel, {sequelize: database});
    RatingNote.init(RatingNoteModel, {sequelize: database});
    UserTimings.init(UserTimingsModel, {sequelize: database});
    GuildConfig.init(GuildConfigModel, {sequelize: database});

    await database.sync({alter: true}); // Не использовать force, т.к. это DROP TABLE IF EXISTS
    console.log("Database started");
}
