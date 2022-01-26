import {ButtonComponent, Discord} from "discordx";
import {ButtonInteraction, GuildMember} from "discord.js";
import {BotlibEmbeds} from "../../../botlib/botlib.embeds";
import {RoleConfig} from "../role.config";

@Discord()
export abstract class RoleButtonsResolver{
    roleConfig: RoleConfig = new RoleConfig();
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();

    @ButtonComponent(/roles-\d+/)
    async blindDraftButton(interaction: ButtonInteraction) {
        let roleIndex: number = Number(interaction.customId.slice(interaction.customId.indexOf("-") + 1));
        let roleID: string = this.roleConfig.rolesID[roleIndex];
        let member: GuildMember = interaction.member as GuildMember;
        let hasRole: boolean = member.roles.cache.has(roleID);

        if(hasRole)
            await member.roles.remove(roleID);
        else
            await member.roles.add(roleID);

        await interaction.reply({
            embeds: this.botlibEmbeds.notify(`${hasRole ? "🚫" : "👤"} Вы ${hasRole ? "убрали" : "получили"} роль **${this.roleConfig.rolesName[roleIndex]}**.`),
            ephemeral: true
        });
    }
}
