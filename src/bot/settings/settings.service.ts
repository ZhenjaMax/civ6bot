import {GuildConfigService, IGuildConfig} from "../../db/models/db.GuildConfig";
import {CommandInteraction, Message} from "discord.js";
import {SettingsEmbeds} from "./settings.embeds";
import {PermissionsService} from "../permissions/permissions.service";
import {BotlibEmbeds} from "../../botlib/botlib.embeds";
import {SettingsButtons} from "./buttons/settings.buttons";
import {SettingsObject} from "./settings.models";
import {SettingsConfig} from "./settings.config";

export class SettingsService{
    settingsConfig: SettingsConfig = new SettingsConfig();
    settingsButtons: SettingsButtons = new SettingsButtons();
    settingsEmbeds: SettingsEmbeds = new SettingsEmbeds();
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();
    guildConfigService: GuildConfigService = new GuildConfigService();
    permissionsService: PermissionsService = PermissionsService.Instance;

    settingsObjectArray: SettingsObject[] = [];

    private static _instance: SettingsService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    getSettingsObject(guildID: string): SettingsObject | undefined { return this.settingsObjectArray.filter(x => x.guildConfig.guildID == guildID)[0] }

    async clearSettingsObjectArray(guildID: string){
        let currentSettingsObject: SettingsObject|undefined = this.getSettingsObject(guildID);
        if(currentSettingsObject) {
            await currentSettingsObject.message.delete();
            this.settingsObjectArray.splice(this.settingsObjectArray.indexOf(currentSettingsObject), 1);
        }
    }

    async setup(interaction: CommandInteraction, settingType: string){
        await interaction.deferReply();
        if(!await this.permissionsService.getUserPermissionStatus(interaction, 5))
            return await interaction.editReply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды.")});
        await this.clearSettingsObjectArray(interaction.guildId);
        await interaction.editReply({
            embeds: [this.settingsEmbeds.command("setup", settingType)],
            components: this.settingsButtons.settingsSetup()
        });
    }

    async reset(interaction: CommandInteraction, settingType: string){
        await interaction.deferReply();
        if(!await this.permissionsService.getUserPermissionStatus(interaction, 5))
            return await interaction.editReply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды.")});
        await this.clearSettingsObjectArray(interaction.guildId);
        let msg: Message = await interaction.editReply({
            embeds: [this.settingsEmbeds.command("reset", settingType)],
            components: this.settingsButtons.settingsReset(),
        }) as Message;
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(interaction.guildId);
        this.settingsObjectArray.push(new SettingsObject(interaction, msg, guildConfig, this.settingsConfig.settingsTypes.indexOf(settingType)));
    }

    async status(interaction: CommandInteraction){
        await interaction.deferReply();
        if(!await this.permissionsService.getUserPermissionStatus(interaction, 5))
            return await interaction.editReply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды.")});
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(interaction.guildId);
        await interaction.editReply({embeds: [this.settingsEmbeds.status(guildConfig)]});
    }

    async resetType(settingsObject: SettingsObject){
        let guildConfig: IGuildConfig = settingsObject.guildConfig;
        switch (settingsObject.type){
            case 0:
                guildConfig.draftBlindCivilizationMin = 1;
                guildConfig.draftBlindCivilizationMax = 16;
                guildConfig.draftFFACivilizationMin = 1;
                guildConfig.draftFFACivilizationMax = 16;
                break;
            case 1:
                guildConfig.feedbackProposalChannelID = null;
                guildConfig.feedbackProposalHoursMin = 4;
                break;
            case 2:
                guildConfig.moderationAdministratorRoleID = null;
                guildConfig.moderationModeratorRoleID = null;
                guildConfig.moderationSupportRoleID = null;
                guildConfig.moderationRoleBanID = null;
                guildConfig.moderationMuteVoiceRoleID = null;
                guildConfig.moderationMuteChatRoleID = null;
                guildConfig.moderationPunishmentChannelID = null;
                guildConfig.moderationClearMax = 10;
                guildConfig.moderationBanTier1 = 1;
                guildConfig.moderationBanTier2 = 2;
                guildConfig.moderationBanTier3 = 3;
                guildConfig.moderationBanTier4 = 5;
                guildConfig.moderationBanTier5 = 7;
                guildConfig.moderationBanTier6 = 14;
                guildConfig.moderationBanTier7 = 28;
                guildConfig.moderationBanTier8 = 365;
                guildConfig.moderationWeakPointsMax = 5;
                break;
            case 3:
                guildConfig.ratingChannelID = null;
                guildConfig.ratingReportsChannelID = null;
                guildConfig.ratingD = 400;
                guildConfig.ratingMinRole0 = 0;
                guildConfig.ratingMinRole1 = 850;
                guildConfig.ratingMinRole2 = 900;
                guildConfig.ratingMinRole3 = 1000;
                guildConfig.ratingMinRole4 = 1100;
                guildConfig.ratingMinRole5 = 1190;
                guildConfig.ratingMinRole6 = 1270;
                guildConfig.ratingMinRole7 = 1340;
                guildConfig.ratingMinRole8 = 1400;
                guildConfig.ratingRoleID0 = null;
                guildConfig.ratingRoleID1 = null;
                guildConfig.ratingRoleID2 = null;
                guildConfig.ratingRoleID3 = null;
                guildConfig.ratingRoleID4 = null;
                guildConfig.ratingRoleID5 = null;
                guildConfig.ratingRoleID6 = null;
                guildConfig.ratingRoleID7 = null;
                guildConfig.ratingRoleID8 = null;
                guildConfig.ratingMultiplierMoney = 1.5;
                guildConfig.ratingMultiplierRating = 1.3;
                guildConfig.ratingBaseMoney = 35;
                break;
            case 4:
                guildConfig.leaderboardRatingChannelID = null;
                guildConfig.leaderboardRatingFFAChannelID = null;
                guildConfig.leaderboardRatingTeamersChannelID = null;
                guildConfig.leaderboardFameChannelID = null;
                guildConfig.leaderboardMoneyChannelID = null;
                guildConfig.leaderboardRatingMessageID = null;
                guildConfig.leaderboardRatingFFAMessageID = null;
                guildConfig.leaderboardRatingTeamersMessageID = null;
                guildConfig.leaderboardFameMessageID = null;
                guildConfig.leaderboardMoneyMessageID = null;
                guildConfig.leaderboardRatingAmount = 0;
                guildConfig.leaderboardRatingFFAAmount = 0;
                guildConfig.leaderboardRatingTeamersAmount = 0;
                guildConfig.leaderboardFameAmount = 0;
                guildConfig.leaderboardMoneyAmount = 0;
                break;
            case 5:
                guildConfig.socialBaseMoney = 25;
                guildConfig.socialFameForDislike = 50;
                break;
        }
        await this.guildConfigService.update(guildConfig);
    }

    async setupType(){

    }
}
