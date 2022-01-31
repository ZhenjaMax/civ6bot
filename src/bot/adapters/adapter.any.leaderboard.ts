import {LeaderboardService} from "../leaderboard/leaderboard.service";
import {ButtonInteraction, CommandInteraction} from "discord.js";

export class AdapterAnyLeaderboard{
    leaderboardService: LeaderboardService = LeaderboardService.Instance;

    async update(interaction: CommandInteraction | ButtonInteraction, type: string){ await this.leaderboardService.update(interaction, type) }
}