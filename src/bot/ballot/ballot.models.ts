import {User} from "discord.js";
import {IUserRating} from "../../db/models/db.UserRating";
import {IUserTimings} from "../../db/models/db.UserTimings";
import {BallotConfig} from "./ballot.config";
import {BotlibTimings} from "../../botlib/botlib.timings";

export class BallotObject{
    user: User;
    isDefault: boolean;
    comment: string;

    games: number;
    gamesFFA: number;
    gamesTeamers: number;

    lastGame: Date | null;
    lastBan: Date | null;

    warningLevel: number = 0;
    warningLevelBans: number = 0;
    warningLevelGame: number = 0;

    constructor(user: User, isDefault: boolean, comment: string, userRating: IUserRating, userTimings: IUserTimings) {
        this.user = user;
        this.isDefault = isDefault;
        this.games = userRating.games;
        this.gamesFFA = userRating.victoriesFFA + userRating.defeatsFFA;
        this.gamesTeamers = userRating.victoriesTeamers + userRating.defeatsTeamers;
        this.lastGame = userTimings.game;
        this.lastBan = userTimings.ban;
        this.comment = comment;

        let ballotConfig: BallotConfig = new BallotConfig();
        let botlibTimings: BotlibTimings = new BotlibTimings();

        let banDays: number = botlibTimings.getDaysDifference(this.lastBan);
        if(banDays > ballotConfig.lastBanWarningMajor)
            this.warningLevelBans += 2;
        else if(banDays > ballotConfig.lastBanWarningMinor)
            this.warningLevelBans++;

        let gameDays: number = botlibTimings.getDaysDifference(this.lastGame)
        if((gameDays == -1) || (gameDays > ballotConfig.lastGameWarningMajor))
            this.warningLevelGame += 2;
        else if(gameDays > ballotConfig.lastGameWarningMinor)
            this.warningLevelGame++;

        this.warningLevel = this.warningLevelBans+this.warningLevelGame;
    }
}
