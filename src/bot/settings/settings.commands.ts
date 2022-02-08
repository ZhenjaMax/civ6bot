import {Discord, Slash, SlashChoice, SlashGroup, SlashOption} from "discordx";
import {CommandInteraction} from "discord.js";
import {SettingsService} from "./settings.service";

@Discord()
@SlashGroup("settings", "Настройки бота")
export abstract class RoleCommands{
    settingsService: SettingsService = SettingsService.Instance;

    @Slash("status", {description: "Посмотреть текущие настройки бота"})
    async status(interaction: CommandInteraction){ await this.settingsService.status(interaction) }

    @Slash("reset", {description: "Сбросить конкретную или все настройки бота"})
    async reset(
        @SlashChoice("драфт", "draft")
        @SlashChoice("фидбек", "feedback")
        @SlashChoice("модерация", "moderation")
        @SlashChoice("рейтинг", "rating")
        @SlashChoice("таблица-лидеров", "leaderboard")
        @SlashChoice("социальные", "social")
        @SlashOption("тип-настроек", { description: "Список настроек бота по типу", required: true }) settingType: string,
        interaction: CommandInteraction
    ){ await this.settingsService.reset(interaction, settingType) }

    @Slash("setup", {description: "Начать настройку бота"})
    async setup(
        @SlashChoice("драфт", "draft")
        @SlashChoice("фидбек", "feedback")
        @SlashChoice("модерация", "moderation")
        @SlashChoice("рейтинг", "rating")
        @SlashChoice("таблица-лидеров", "leaderboard")
        @SlashChoice("социальные", "social")
        @SlashOption("тип-настроек", { description: "Список настроек бота по типу", required: true }) settingType: string,
        interaction: CommandInteraction
    ){ await this.settingsService.setup(interaction, settingType) }
}
