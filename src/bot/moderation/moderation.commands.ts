import {Discord, Slash, SlashChoice, SlashOption} from "discordx";
import {ModerationService} from "./moderation.service";
import {CommandInteraction, GuildMember} from "discord.js";

@Discord()
export abstract class ModerationCommands{
    moderationService: ModerationService = ModerationService.Instance;

    @Slash("ban", {description: "Временно забанить игрока"})
    async ban(
        @SlashOption("игрок", {description: "пользователь, который получит бан", required: true, type: "USER"}) member: GuildMember,
        @SlashChoice("секунд", "s")
        @SlashChoice("минут", "m")
        @SlashChoice("часов", "h")
        @SlashChoice("дней", "d")
        @SlashOption("время", {description: "единица измерения", required: true }) timeType: string,
        @SlashOption("количество", {description: "количество единиц времени",  required: true, type: "NUMBER"}) timeAmount: number,
        @SlashOption("причина", {description: "описание причины", required: true, type: "STRING"}) reason: string,
        interaction: CommandInteraction
    ){ await this.moderationService.ban(interaction, member, timeType, timeAmount, reason) }

    @Slash("ban-tier", {description: "Забанить игрока по прогрессивной шкале"})
    async banTier(
        @SlashOption("игрок", {description: "пользователь, который получит бан", required: true, type: "USER"}) member: GuildMember,
        @SlashOption("причина", {description: "описание причины", required: true, type: "STRING"}) reason: string,
        interaction: CommandInteraction
    ){ await this.moderationService.banTier(interaction, member, reason) }

    @Slash("ban-tier-set", {description: "Установить значение уровня бана"})
    async banTierSet(
        @SlashOption("игрок", {description: "пользователь, который получит бан", required: true, type: "USER"}) member: GuildMember,
        @SlashOption("уровень", {description: "новый уровень бана", required: true, type: "NUMBER"}) banTier: number,
        @SlashOption("причина", {description: "описание причины", required: false, type: "STRING"}) reason: string = "",
        interaction: CommandInteraction
    ) { await this.moderationService.banTierSet(interaction, member, banTier, reason) }

    @Slash("mute", {description: "Заглушить игрока"})
    async mute(
        @SlashOption("игрок", {description: "пользователь, который получит мут", required: true, type: "USER"}) member: GuildMember,
        @SlashChoice("текстовые каналы", "Text")
        @SlashChoice("голосовые каналы", "Voice")
        @SlashOption("тип-мута", {description: "тип мута", required: true}) muteType: string,
        @SlashChoice("секунд", "s")
        @SlashChoice("минут", "m")
        @SlashChoice("часов", "h")
        @SlashChoice("дней", "d")
        @SlashOption("время", {description: "единица измерения", required: true}) timeType: string,
        @SlashOption("количество", {description: "количество единиц времени",  required: true, type: "NUMBER"}) timeAmount: number,
        @SlashOption("причина", {description: "описание причины", required: true, type: "STRING"}) reason: string,
        interaction: CommandInteraction
    ){ await this.moderationService.mute(interaction, member, muteType, timeType, timeAmount, reason) }

    @Slash("unban", {description: "Разбанить игрока"})
    async unban(
        @SlashOption("игрок", {description: "пользователь, который будет разбанен", required: true, type: "USER"}) member: GuildMember,
        @SlashOption("причина", { description: "описание причины", required: false, type: "STRING" }) reason: string = "",
        interaction: CommandInteraction
    ) { await this.moderationService.unban(interaction, member, reason) }

    @Slash("unmute", {description: "Размутить игрока"})
    async unmute(
        @SlashOption("игрок", {description: "пользователь, который будет размучен", required: true, type: "USER"}) member: GuildMember,
        @SlashChoice("текстовые каналы", "Text")
        @SlashChoice("голосовые каналы", "Voice")
        @SlashOption("тип-мута", {description: "тип мута", required: true}) muteType: string,
        @SlashOption("причина", {description: "описание причины", required: false, type: "STRING"}) reason: string = "",
        interaction: CommandInteraction
    ) { await this.moderationService.unmute(interaction, member, muteType, reason) }

    @Slash("pardon", {description: "Снять все ограничения у игрока"})
    async pardon(
        @SlashOption("игрок", {description: "пользователь, который будет размучен", required: true, type: "USER"}) member: GuildMember,
        @SlashOption("причина", {description: "описание причины", required: false, type: "STRING"}) reason: string = "",
        interaction: CommandInteraction
    ) { await this.moderationService.pardon(interaction, member, reason) }

    @Slash("clear", {description: "Очистить сообщения в чате"})
    async clear(
        @SlashOption("количество", {description: "количество сообщений для удаления", required: true, type: "NUMBER"}) clearAmount: number,
        interaction: CommandInteraction
    ) { await this.moderationService.clear(interaction, clearAmount) }
}
