import {Discord, Slash, SlashGroup} from "discordx";
import {CommandInteraction} from "discord.js";
import {CommunityService} from "./community.service";

@Discord()
@SlashGroup("rules", "Краткое описание правил")
export abstract class CommunityCommands{
    communityService: CommunityService = CommunityService.Instance;

    @Slash("scrap", { description: "Окончание игры без определенного победителя" })
    async scrap(interaction: CommandInteraction){ await this.communityService.getRule(interaction, "scrap") }

    @Slash("irrelevant", { description: "Просьба игрока покинуть FFA до завершения" })
    async irrelevant(interaction: CommandInteraction){ await this.communityService.getRule(interaction, "irrelevant") }

    @Slash("remap", { description: "Голосование за смену игровой карты" })
    async remap(interaction: CommandInteraction){ await this.communityService.getRule(interaction, "remap") }

    @Slash("leave", { description: "Запрещено покидать игру до её окончания" })
    async leave(interaction: CommandInteraction){ await this.communityService.getRule(interaction, "leave") }

    @Slash("veto", { description: "Право игрока единолично признать любое голосование в FFA проваленным" })
    async veto(interaction: CommandInteraction){ await this.communityService.getRule(interaction, "veto") }

    @Slash("tie", { description: "Ничья и смена места" })
    async tie(interaction: CommandInteraction){ await this.communityService.getRule(interaction, "tie") }

    @Slash("sub", { description: "Один из игроков выходит из игры, и на его место приходит другой игрок" })
    async sub(interaction: CommandInteraction){ await this.communityService.getRule(interaction, "sub") }

    @Slash("cc", { description: "Досрочное окончание FFA с определенным победителем" })
    async cc(interaction: CommandInteraction){ await this.communityService.getRule(interaction, "cc") }
}
