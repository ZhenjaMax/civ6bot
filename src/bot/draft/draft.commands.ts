import {Discord, Slash, SlashGroup, SlashOption} from "discordx";
import {CommandInteraction} from "discord.js";
import {DraftService} from "./draft.service";
import {DraftEmbedObject} from "./draft.models"

@Discord()
@SlashGroup("draft", "Драфт для начала игры")
export abstract class DraftCommands {
    draftService: DraftService = DraftService.Instance;

    @Slash("ffa", { description: "Драфт цивилизаций для FFA" })
    async draftFFA(
        @SlashOption("количество-цивилизаций", { required: false }) amount: number = 0,
        @SlashOption("баны", { required: false }) bans: string = "",
        interaction: CommandInteraction
    ) {
        await interaction.reply( { embeds: [this.draftService.getDraftFFA(interaction, new DraftEmbedObject(interaction, amount, bans))] } );
    }

    // Возвращает массив сообщений
    // interaction.reply изменён (без [])
    @Slash("teamers", { description: "Драфт цивилизаций для Teamers" })
    async draftTeamers(
        @SlashOption("количество-команд", { required: false }) amount: number = 2,
        @SlashOption("баны", { required: false }) bans: string = "",
        interaction: CommandInteraction
    ) {
        await interaction.reply( { embeds: this.draftService.getDraftTeamers(interaction, new DraftEmbedObject(interaction, amount, bans)) } );
    }

    @Slash("blind", { description: "Драфт цивилизаций для FFA вслепую" })
    async draftBlind(
        @SlashOption("количество-цивилизаций", { required: false }) amount: number = 0,
        @SlashOption("баны", { required: false }) bans: string = "",
        interaction: CommandInteraction
    ) {
        await interaction.reply({ embeds: [this.draftService.getDraftBlind(interaction, new DraftEmbedObject(interaction, amount, bans))] });
    }
}

@Discord()
export abstract class RedraftCommands{
    draftService: DraftService = DraftService.Instance;

    @Slash("redraft", { description: "Получить редрафт последнего драфта" })
    async redraft(interaction: CommandInteraction){
        this.draftService.getRedraft(interaction);
        return;
    }
}
