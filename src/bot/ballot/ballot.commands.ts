import {Discord, Slash, SlashGroup, SlashOption} from "discordx";
import {BallotService} from "./ballot.service";
import {CommandInteraction, GuildMember} from "discord.js";

@Discord()
@SlashGroup("ballot", "Команды для ежемесячных голосований за модератора")
export abstract class BallotCommands{
    ballotService: BallotService = BallotService.Instance;

    @Slash("create", {description: "Создать сообщение с голосованием"})
    async create(
        @SlashOption("игрок", { required: true, type: "USER" }) member: GuildMember,
        @SlashOption("по-умолчанию", { description: "Модератор по умолчанию?", required: true, type: "BOOLEAN" }) isDefault: boolean,
        @SlashOption("описание", { required: false }) content: string = "",
        interaction: CommandInteraction
    ) { await this.ballotService.create(interaction, member, isDefault, content) }

    @Slash("resolve", {description: "Показать результаты голосований"})
    async resolve(interaction: CommandInteraction) { await this.ballotService.resolve(interaction) }
}
