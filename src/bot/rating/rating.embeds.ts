import {MessageEmbed, User} from "discord.js";
import {RatingObject} from "./rating.models";
import {IUserRating} from "../../db/models/db.UserRating";
import {BotlibEmojis} from "../../botlib/botlib.emojis";

export class RatingEmbeds{
    botlibEmojis: BotlibEmojis = new BotlibEmojis();

    ratingSingle(user: User, author: User, ratingType: string, ratingChange: number, ratingAmount: number): MessageEmbed{
        return new MessageEmbed()
            .setTitle(`${ratingChange > 0 ? "📈" : "📉"} Изменение рейтинга`)
            .setColor("#00FFFF")
            .setFooter(`Администратор ${author.tag}`, author.avatarURL() || undefined)
            .addField("Игрок", user.toString(), true)
            .addField("Тип рейтинга", (ratingType == "Common") ? "Общий" : ratingType, true)
            .addField("Значение:", `**${ratingChange > 0 ? "+" : ""}${ratingChange} ${ratingChange > 0 ? "📈" : "📉"} (${ratingAmount})**`, true);
    }

    ratingDefault(author: User, ratingObject: RatingObject, userRatingsConcat: IUserRating[]): MessageEmbed{
        let users: string = "", usersIndex: number, tieIndexes: number[] | undefined, ratings: string = "", prizes: string = "";
        for(let i: number = 0; i < ratingObject.ratingNotes.length; i++){
            usersIndex = Math.floor(i/ratingObject.usersPerCommand);
            tieIndexes = ratingObject.tieIndex.filter(x => (x.indexOf(usersIndex) != -1))[0];
            users += `${(tieIndexes)
                ? `**${this.botlibEmojis.numbers[tieIndexes[0]]}...${this.botlibEmojis.numbers[tieIndexes[tieIndexes.length-1]]}**` 
                : `${this.botlibEmojis.numbers[usersIndex]}`} `;
            users += `**${ratingObject.usernames[i]}** ${ratingObject.subIndex.indexOf(i) != -1 ? "🔄" : ""}${ratingObject.leaveUsersID.indexOf(ratingObject.ratingNotes[i].userID) != -1 ? "💨" : ""}\n`;
            ratings += `**${ratingObject.ratingNotes[i].ratingTyped > 0 ? "+" : ""}${ratingObject.ratingNotes[i].ratingTyped} ${ratingObject.ratingNotes[i].ratingTyped > 0 ? "📈" : "📉"} (${ratingObject.gameType ? userRatingsConcat[i].ratingTeamers : userRatingsConcat[i].ratingFFA})**\n`;
            prizes += `**+${ratingObject.ratingNotes[i].money} 🪙 | +${ratingObject.ratingNotes[i].fame} 🏆**\n`;
            if(((i+1)%ratingObject.usersPerCommand == 0) && (ratingObject.gameType)){
                users += "\n";
                ratings += "\n";
                prizes += "\n";
            }
        }
        for(let i: number = 0; i < ratingObject.ratingNotesSub.length; i++){
            users += `\n🔄 **${ratingObject.usernames[i+ratingObject.ratingNotes.length]}** ${ratingObject.leaveUsersID.indexOf(ratingObject.ratingNotesSub[i].userID) != -1 ? "💨" : ""}`;
            ratings += `\n**${ratingObject.ratingNotesSub[i].ratingTyped > 0 ? "+" : ""}${ratingObject.ratingNotesSub[i].ratingTyped} ${ratingObject.ratingNotesSub[i].ratingTyped > 0 ? "📈" : "📉"} (${ratingObject.gameType ? userRatingsConcat[i+ratingObject.ratingNotes.length].ratingTeamers : userRatingsConcat[i+ratingObject.ratingNotes.length].ratingFFA})**`;
            prizes += `\n**+${ratingObject.ratingNotesSub[i].money} 🪙 | +${ratingObject.ratingNotesSub[i].fame} 🏆**`;
        }
        let victoryType: string = (ratingObject.victoryType > 0)
            ? ratingObject.ratingConfig.victoryTypeNames[ratingObject.victoryType-1]
            : ratingObject.ratingConfig.victoryCommonNames[ratingObject.gameType];
        let msg: MessageEmbed = new MessageEmbed()
            .setTitle(`📈 Изменение рейтинга`)
            .setColor("#00FFFF")
            .setFooter(`Администратор ${author.tag}`, author.avatarURL() || undefined)
            .addField("Тип игры:", (ratingObject.gameType) ? "Teamers" : "FFA", true)
            .addField("Тип победы:", victoryType, true)
            .addField("ID игры:", `**__#${ratingObject.ratingNotes[0].gameID}__**`, true)
            .addField("Игрок:", users, true)
            .addField("Рейтинг:", ratings, true)
            .addField("Бонус:", prizes, true);
        if(ratingObject.victoryType > 0)
            msg.setThumbnail(ratingObject.ratingConfig.victoryThumbnailsURL[ratingObject.ratingNotes[0].victoryType-1])
        return msg;
    }

    ratingAwait(user: User, ratingObject: RatingObject): MessageEmbed{
        let users: string = "", usersIndex: number, tieIndexes: number[];
        for(let i: number = 0; i < ratingObject.usersID.length; i++){
            usersIndex = Math.floor(i/ratingObject.usersPerCommand);
            tieIndexes = ratingObject.tieIndex.filter(x => (x.indexOf(usersIndex) != -1))[0];
            users += `${(tieIndexes) 
                ? `**${this.botlibEmojis.numbers[tieIndexes[0]]}...${this.botlibEmojis.numbers[tieIndexes[tieIndexes.length-1]]}**`
                : `${this.botlibEmojis.numbers[usersIndex]}`} `;
            users += `**${ratingObject.usernames[i]}** ${ratingObject.subIndex.indexOf(i) != -1 ? "🔄" : ""}${ratingObject.leaveUsersID.indexOf(ratingObject.usersID[i]) != -1 ? "💨" : ""}\n`;
            if(((i+1)%ratingObject.usersPerCommand == 0) && (ratingObject.gameType))
                users += "\n";
        }
        for(let i: number = 0; i < ratingObject.subUsersID.length; i++)
            users += `\n🔄 **${ratingObject.usernames[i+ratingObject.usersID.length]}** ${ratingObject.leaveUsersID.indexOf(ratingObject.usersID[i]) != -1 ? "💨" : ""}`;
        let victoryType: string = (ratingObject.victoryType > 0)
            ? ratingObject.ratingConfig.victoryTypeNames[ratingObject.victoryType-1]
            : ratingObject.ratingConfig.victoryCommonNames[ratingObject.gameType];
        let msg: MessageEmbed = new MessageEmbed()
            .setTitle(`📈 Отчет о рейтинге`)
            .setColor("#00FFFF")
            .setDescription(`**__Возможные действия для игроков:__**
            ${this.botlibEmojis.yes} Подтвердить рейтинг.
            ${this.botlibEmojis.no} Оспорить рейтинг.`)
            .setFooter(`${user.tag}`, user.avatarURL() || undefined)
            .addField("Игрок:", users, true)
            .addField("Тип игры:", (ratingObject.gameType) ? "Teamers" : "FFA", true)
            .addField("Тип победы:", victoryType, true)
        if(ratingObject.victoryType > 0)
            msg.setThumbnail(ratingObject.ratingConfig.victoryThumbnailsURL[ratingObject.victoryType-1])
        return msg;
    }

    ratingCancel(author: User, ratingObject: RatingObject, userRatingsConcat: IUserRating[]): MessageEmbed{
        let users: string = "", ratings: string = "", prizes: string = "";
        for(let i: number = 0; i < ratingObject.ratingNotes.length; i++) {
            users += `**${ratingObject.usernames[i]}**\n`;
            ratings += `**${-ratingObject.ratingNotes[i].ratingTyped > 0 ? "+" : ""}${-ratingObject.ratingNotes[i].ratingTyped} ${-ratingObject.ratingNotes[i].ratingTyped > 0 ? "📈" : "📉"} (${ratingObject.ratingNotes[0].gameType ? userRatingsConcat[i].ratingTeamers : userRatingsConcat[i].ratingFFA})**\n`;
            prizes += `**+${-ratingObject.ratingNotes[i].money} 🪙 | +${-ratingObject.ratingNotes[i].fame} 🏆**\n`;
        }
        return new MessageEmbed()
            .setTitle("📉 Отмена отчета о рейтинге")
            .setColor("#008888")
            .setDescription(`ID игры: **__#${ratingObject.ratingNotes[0].gameID}__**\n\n❗ **Все полученные за эту игру награды аннулируются.**`)
            .setFooter(`Администратор ${author.tag}`, author.avatarURL() || undefined)
            .addField("Игрок:", users, true)
            .addField("Рейтинг:", ratings, true)
            .addField("Возврат:", prizes, true);
    }

    ratingRevert(author: User, ratingObject: RatingObject, userRatingsConcat: IUserRating[]): MessageEmbed{
        let users: string = "", ratings: string = "", prizes: string = "";
        for(let i: number = 0; i < ratingObject.ratingNotes.length; i++) {
            users += `**${ratingObject.usernames[i]}**\n`;
            ratings += `**${ratingObject.ratingNotes[i].ratingTyped > 0 ? "+" : ""}${ratingObject.ratingNotes[i].ratingTyped} ${ratingObject.ratingNotes[i].ratingTyped > 0 ? "📈" : "📉"} (${ratingObject.ratingNotes[0].gameType ? userRatingsConcat[i].ratingTeamers : userRatingsConcat[i].ratingFFA})**\n`;
            prizes += `**+${ratingObject.ratingNotes[i].money} 🪙 | +${ratingObject.ratingNotes[i].fame} 🏆**\n`;
        }
        let victoryType: string = (ratingObject.ratingNotes[0].victoryType > 0)
            ? ratingObject.ratingConfig.victoryTypeNames[ratingObject.ratingNotes[0].victoryType-1]
            : ratingObject.ratingConfig.victoryCommonNames[ratingObject.ratingNotes[0].gameType];
        let msg: MessageEmbed = new MessageEmbed()
            .setTitle("📈 Восстановление отчета о рейтинге")
            .setColor("#00FFFF")
            .setDescription("🔄 **Рейтинг был успешно восстановлен.**")
            .addField("Тип игры:", (ratingObject.ratingNotes[0].gameType) ? "Teamers" : "FFA", true)
            .addField("Тип победы:", victoryType, true)
            .addField("ID игры:", `**__#${ratingObject.ratingNotes[0].gameID}__**`, true)
            .setFooter(`Администратор ${author.tag}`, author.avatarURL() || undefined)
            .addField("Игрок:", users, true)
            .addField("Рейтинг:", ratings, true)
            .addField("Бонус:", prizes, true);
        if(ratingObject.victoryType > 0)
            msg.setThumbnail(ratingObject.ratingConfig.victoryThumbnailsURL[ratingObject.ratingNotes[0].victoryType-1])
        return msg;
    }
}
