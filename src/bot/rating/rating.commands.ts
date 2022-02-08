import {Discord, Slash, SlashChoice, SlashGroup, SlashOption} from "discordx";
import {CommandInteraction, GuildMember} from "discord.js";
import {RatingService} from "./rating.service";

@Discord()
@SlashGroup("rating", "Начисление рейтинга")
export abstract class RatingCommands{
    ratingService: RatingService = RatingService.Instance;

    @Slash("ffa", { description: "Рейтинг для FFA" })
    async ratingFFA(
        @SlashChoice("дипломатическая", "diplomatic")
        @SlashChoice("религиозная", "religious")
        @SlashChoice("военная", "domination")
        @SlashChoice("культурная", "culture")
        @SlashChoice("научная", "science")
        @SlashChoice("CC", "cc")
        @SlashOption("победа", { description: "Тип победы", required: true }) victoryType: string,
        @SlashOption("игроки", { description: "Список игроков с опциями SUB, LEAVE, TIE", required: true }) players: string,
        interaction: CommandInteraction
    ){ await this.ratingService.rating(interaction, "FFA", victoryType, players) }

    @Slash("teamers", { description: "Рейтинг для Teamers" })
    async ratingTeamers(
        @SlashChoice("дипломатическая", "diplomatic")
        @SlashChoice("религиозная", "religious")
        @SlashChoice("военная", "domination")
        @SlashChoice("культурная", "culture")
        @SlashChoice("научная", "science")
        @SlashChoice("GG", "gg")
        @SlashOption("победа", { description: "Тип победы", required: true }) victoryType: string,
        @SlashOption("игроки", { description: "Список игроков с опциями SUB, LEAVE, TIE; игроков из одной команды записывать подряд", required: true }) players: string, // ; для ничьи между командами впишите TIE между группами игроков
        @SlashOption("количество-команд", {description: "по умолчанию - 2 команды"}) commandsAmount: number = 2,
        interaction: CommandInteraction
    ){ await this.ratingService.rating(interaction, "Teamers", victoryType, players, commandsAmount) }

    @Slash("set", { description: "Установить рейтинг для игрока" })
    async ratingSet(
        @SlashOption("игрок", {description: "игрок, которому изменяется рейтинг", required: true, type: "USER"}) member: GuildMember,
        @SlashChoice("FFA", "FFA")
        @SlashChoice("Teamers", "Teamers")
        @SlashChoice("общий", "Common")
        @SlashOption("тип-рейтинга", { description: "общий рейтинг влияет на роль игрока", required: true }) ratingType: string,
        @SlashOption("количество", {description: "новое значение рейтинга", required: true}) ratingAmount: number,
        interaction: CommandInteraction
    ) { await this.ratingService.ratingSet(interaction, member, ratingType, ratingAmount) }

    @Slash("add", { description: "Добавить или отнять рейтинг у игрока" })
    async ratingAdd(
        @SlashOption("игрок", {description: "игрок, которому изменяется рейтинг", required: true, type: "USER"}) member: GuildMember,
        @SlashChoice("FFA", "FFA")
        @SlashChoice("Teamers", "Teamers")
        @SlashChoice("общий", "Common")
        @SlashOption("тип-рейтинга", { description: "общий рейтинг влияет на роль игрока", required: true }) ratingType: string,
        @SlashOption("количество", {description: "количество рейтинга", required: true}) ratingAmount: number,
        interaction: CommandInteraction
    ) { await this.ratingService.ratingAdd(interaction, member, ratingType, ratingAmount) }

    @Slash("cancel", { description: "Отменить результат игры" })
    async ratingCancel(
        @SlashOption("номер-игры", {description: "порядковый номер отчета", required: true}) game: number,
        interaction: CommandInteraction
    ) { await this.ratingService.ratingCancel(interaction, game) }

    @Slash("revert", { description: "Восстановить отмененную игру" })
    async ratingRevert(
        @SlashOption("номер-игры", {description: "порядковый номер отчета", required: true}) game: number,
        interaction: CommandInteraction
    ) { await this.ratingService.ratingRevert(interaction, game) }
}
