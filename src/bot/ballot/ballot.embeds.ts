import {BallotObject} from "./ballot.models";
import {MessageEmbed} from "discord.js";
import {BallotConfig} from "./ballot.config";
import {BotlibTimings} from "../../botlib/botlib.timings";

export class BallotEmbeds{
    ballotConfig: BallotConfig = new BallotConfig();
    botlibTimings: BotlibTimings = new BotlibTimings();

    ballot(ballotObject: BallotObject): MessageEmbed{
        let warningEmoji = function(level: number){switch(level){
            case 1:
                return "⚠️";
            case 2:
                return "😡";
            default:
                return "⏰";
        }};

        return new MessageEmbed()
            .setColor(this.ballotConfig.colorBallot[ballotObject.warningLevel])
            .setTitle("🔧 Голосование за модератора")
            .setDescription(`**Игрок:** ${ballotObject.user.toString()}
            
            🔎 **Количество игр:** ${ballotObject.games}
            🗿 **Игр FFA:** ${ballotObject.gamesFFA}
            🐲 **Игр Teamers:** ${ballotObject.gamesTeamers}
            
            ${warningEmoji(ballotObject.warningLevelGame)} **Дата последней игры:** ${ballotObject.lastGame ? this.botlibTimings.getDateString(ballotObject.lastGame) : "нет"}
            ${warningEmoji(ballotObject.warningLevelBans)} **Дата последнего бана:** ${ballotObject.lastBan ? this.botlibTimings.getDateString(ballotObject.lastBan) : "нет"}
            ${ballotObject.isDefault ? "\n❗ **Является кандидатом по умолчанию.**\n" : ""}
            📝 **Комментарий:** ${ballotObject.comment}`);
    }
}
