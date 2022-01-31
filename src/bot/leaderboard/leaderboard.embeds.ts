import {ColorResolvable, MessageEmbed} from "discord.js";
import {LeaderboardConfig} from "./leaderboard.config";

export class LeaderboardEmbeds{
    leaderboardConfig: LeaderboardConfig = new LeaderboardConfig();

    leaderboard(users: string[], values: number[], type: string): MessageEmbed[]{
        let typeValue: string = "";
        let color: ColorResolvable = this.leaderboardConfig.colors.get(type) || "#888888";
        switch(type){
            case "rating":
                typeValue = "📈 общий рейтинг";
                break;
            case "ratingFFA":
                typeValue = "🗿 рейтинг FFA";
                break;
            case "ratingTeamers":
                typeValue = "🐲 рейтинг Teamers";
                break;
            case "money":
                typeValue = "🪙 деньги";
                break;
            case "fame":
                typeValue = "🏆 слава";
                break;
        }

        let messages: MessageEmbed[] = [];
        let description: string = "";
        for(let i: number = 0; i < users.length; i++){
            description += `${i < this.leaderboardConfig.topEmojis.length ? (this.leaderboardConfig.topEmojis[i]) : `**${String(i+1) + "."}**`} <@!${users[i]}> — ${typeValue[0]} **${values[i]}**\n${i == this.leaderboardConfig.topEmojis.length-1 ? "\n" : ""}`;
            if(((i+1)%this.leaderboardConfig.usersPerEmbed == 0) || (i+1 == users.length)) {
                messages.push(
                    new MessageEmbed()
                        .setColor(color)
                        .setDescription(description)
                );
                description = "";
            }
        }
        messages[0].setTitle(`🔱 Лучшие игроки сервера: ${typeValue}`);
        return messages;
    }
}
