import {IGuildConfig} from "../../db/models/db.GuildConfig";
import {ButtonInteraction, CommandInteraction, Message} from "discord.js";
import {SettingsConfig} from "./settings.config";

export class SettingsFilter{

}

export class SettingsObject{
    guildConfig: IGuildConfig;
    interaction: CommandInteraction | ButtonInteraction;
    message: Message;

    type: number;
    step: number = 0;
    stepTotal: number;

    isProcessing: boolean = false;

    constructor(interaction: CommandInteraction | ButtonInteraction, message: Message, guildConfig: IGuildConfig, type: number) {
        this.interaction = interaction;
        this.message = message;
        this.guildConfig = guildConfig;

        this.type = type;
        let settingsConfig: SettingsConfig = new SettingsConfig();
        this.stepTotal = settingsConfig.settingsSteps[type];
    }
}
