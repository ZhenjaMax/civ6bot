import {Discord, Slash, SlashGroup, SlashOption} from "discordx";
import {SplitService} from "./split.service";
import {CommandInteraction, GuildMember} from "discord.js";

@Discord()
@SlashGroup("split", "Голосование для начала игры")
export class SplitCommands{
    splitService: SplitService = SplitService.Instance;

    @Slash("classic", {description: "first, double, далее по очереди"})
    async splitClassic(
        @SlashOption("1й-капитан", { required: true, type: "USER" }) captain1: GuildMember,
        @SlashOption("2й-капитан", { required: false, type: "USER" }) captain2: GuildMember | undefined,
        interaction: CommandInteraction
    ){ await this.splitService.split(interaction, [captain1.user, captain2 ? captain2.user : interaction.user]) }

    @Slash("random", {description: "разделение случайным образом"})
    async splitRandom(
        @SlashOption("1й-капитан", { required: false, type: "USER" }) captain1: GuildMember | undefined,
        @SlashOption("2й-капитан", { required: false, type: "USER" }) captain2: GuildMember | undefined,
        interaction: CommandInteraction
    ){ await this.splitService.splitRandom(interaction, [captain1?.user, captain2?.user]) }
}
