import {Discord, Slash, SlashGroup, SlashOption} from "discordx";
import {CommandInteraction} from "discord.js";
import {DraftService} from "./draft.service";

@Discord()
@SlashGroup("draft", "Драфт для начала игры")
export abstract class DraftCommands {
    draftService: DraftService = DraftService.Instance;

    @Slash("ffa", { description: "Драфт цивилизаций для FFA" })
    async draftFFA(
        @SlashOption("количество-цивилизаций", { required: false }) amount: number = 0,
        @SlashOption("баны", { required: false }) bans: string = "",
        interaction: CommandInteraction
    ) { await this.draftService.getDraftFFA(interaction, amount, bans); }

    // Возвращает массив сообщений MessageEmbed[]
    @Slash("teamers", { description: "Драфт цивилизаций для Teamers" })
    async draftTeamers(
        @SlashOption("количество-команд", { required: false }) amount: number = 2,
        @SlashOption("баны", { required: false }) bans: string = "",
        interaction: CommandInteraction
    ) { await this.draftService.getDraftTeamers(interaction, amount, bans); }

    @Slash("blind", { description: "Драфт цивилизаций для FFA вслепую" })
    async draftBlind(
        @SlashOption("количество-цивилизаций", { required: false }) amount: number = 0,
        @SlashOption("баны", { required: false }) bans: string = "",
        interaction: CommandInteraction
    ) { await this.draftService.getDraftBlind(interaction, amount, bans); }
}

@Discord()
export abstract class RedraftCommands{
    draftService: DraftService = DraftService.Instance;

    @Slash("redraft", { description: "Получить редрафт последнего драфта" })
    async redraft(interaction: CommandInteraction){ await this.draftService.getRedraft(interaction); }
}
