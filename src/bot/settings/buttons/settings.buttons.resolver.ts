import {ButtonComponent, Discord} from "discordx";
import {ButtonInteraction, Message} from "discord.js";
import {BotlibEmbeds} from "../../../botlib/botlib.embeds";
import {SettingsService} from "../settings.service";
import {SettingsObject} from "../settings.models";

@Discord()
export abstract class SettingsButtonsResolver{
    settingsService: SettingsService = SettingsService.Instance;
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();

    async settingsButtonRoutineYes(interaction: ButtonInteraction): Promise<SettingsObject|undefined>{
        if(!await this.settingsService.permissionsService.getUserPermissionStatus(interaction, 5)) {
            await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав."), ephemeral: true});
            return undefined;
        }
        let settingsObject: SettingsObject|undefined = this.settingsService.getSettingsObject(interaction.guildId);
        if(!settingsObject)
            await this.deleteMessage(interaction);
        return settingsObject;
    }

    async deleteMessage(interaction: ButtonInteraction) {
        let msg: Message = interaction.message as Message;
        await msg.delete();
    }

    @ButtonComponent("settings-reset-yes")
    async settingsResetYes(interaction: ButtonInteraction) {
        let settingsObject: SettingsObject|undefined = await this.settingsButtonRoutineYes(interaction);
        if(!settingsObject)
            return;
        await interaction.deferUpdate();
        await this.settingsService.resetType(settingsObject);
        let msg: Message = interaction.message as Message;
        await msg.edit({
            embeds: [this.settingsService.settingsEmbeds.resetConfirm(settingsObject.type)],
            components: []
        });
    }

    @ButtonComponent("settings-setup-yes")
    async settingsSetupYes(interaction: ButtonInteraction) {
        let settingsObject: SettingsObject|undefined = await this.settingsButtonRoutineYes(interaction);
        if(!settingsObject)
            return;
        await interaction.deferUpdate();
    }

    @ButtonComponent("settings-reset-no")
    async settingsResetNo(interaction: ButtonInteraction) { await this.deleteMessage(interaction); }
    @ButtonComponent("settings-setup-no")
    async settingsSetupNo(interaction: ButtonInteraction) { await this.deleteMessage(interaction); }
}
