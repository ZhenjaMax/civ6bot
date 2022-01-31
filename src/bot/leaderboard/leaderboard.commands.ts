import {Discord, Slash, SlashChoice, SlashGroup, SlashOption} from "discordx";
import {CommandInteraction} from "discord.js";
import {LeaderboardService} from "./leaderboard.service";

@Discord()
@SlashGroup("leaderboard", "Команды для таблицы лидеров")
export abstract class LeaderboardCommands{
    leaderboardService: LeaderboardService = LeaderboardService.Instance;

    @Slash("create", { description: "Создать таблицу лидеров в определенной категории" })
    async create(
        @SlashChoice("общий рейтинг", "rating")
        @SlashChoice("рейтинг FFA", "ratingFFA")
        @SlashChoice("рейтинг Teamers", "ratingTeamers")
        @SlashChoice("деньги", "money")
        @SlashChoice("слава", "fame")
        @SlashOption("тип-таблицы", { required: true, type: "STRING" }) type: string,
        @SlashOption("количество", { required: true, type: "NUMBER" }) amount: number,
        interaction: CommandInteraction
    ) { await this.leaderboardService.create(interaction, type, amount) }

    @Slash("delete", { description: "Удалить таблицу лидеров в определенной категории" })
    async delete(
        @SlashChoice("общий рейтинг", "rating")
        @SlashChoice("рейтинг FFA", "ratingFFA")
        @SlashChoice("рейтинг Teamers", "ratingTeamers")
        @SlashChoice("деньги", "money")
        @SlashChoice("слава", "fame")
        @SlashOption("тип-таблицы", { required: true, type: "STRING" }) type: string,
        interaction: CommandInteraction
    ) { await this.leaderboardService.delete(interaction, type) }
}
