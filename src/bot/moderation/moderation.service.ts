import {CommandInteraction, Guild, GuildMember, MessageEmbed, Role, TextChannel} from "discord.js";
import {IUserPunishment, UserPunishmentService} from "../../db/models/db.UserPunishment";
import {BotlibTimings} from "../../botlib/botlib.timings";
import {BotlibEmbeds, signEmbed} from "../../botlib/botlib.embeds";
import {ModerationEmbeds} from "./moderation.embeds";
import * as schedule from "node-schedule";
import {Job} from "node-schedule";
import {ClientSingleton} from "../../client/client";
import {Client} from "discordx";
import {IUserProfile, UserProfileService} from "../../db/models/db.UserProfile";
import {IUserTimings, UserTimingsService} from "../../db/models/db.UserTimings";
import {AdapterAnyLeaderboard} from "../adapters/adapter.any.leaderboard";
import {PermissionsService} from "../permissions/permissions.service";
import {GuildConfigService, IGuildConfig} from "../../db/models/db.GuildConfig";

export async function punishmentSchedule(): Promise<void>{
    let currentDate: Date = new Date();
    let userPunishmentService: UserPunishmentService = new UserPunishmentService();
    let usersPunishment: IUserPunishment[] = await userPunishmentService.getAllPunished();
    let moderationService: ModerationService = ModerationService.Instance;
    for(let userPunishment of usersPunishment){
        if(userPunishment.banned && (userPunishment.banned < currentDate))
            await moderationService.unbanAuto(userPunishment);
        if(userPunishment.mutedVoice && (userPunishment.mutedVoice < currentDate))
            await moderationService.unmuteVoiceAuto(userPunishment);
        if(userPunishment.mutedChat && (userPunishment.mutedChat < currentDate))
            await moderationService.unmuteChatAuto(userPunishment);
    }
    await updateNextScheduleJob();
}

export async function updateNextScheduleJob(){
    let nextDate: Date|undefined;
    let userPunishmentService: UserPunishmentService = new UserPunishmentService();
    let usersPunishment: IUserPunishment[] = await userPunishmentService.getAllPunished();
    let moderationService: ModerationService = ModerationService.Instance;
    let dates: Date[] = [];
    usersPunishment.forEach(x => {
        if(x.banned)
            dates.push(x.banned);
        if(x.mutedChat)
            dates.push(x.mutedChat);
        if(x.mutedVoice)
            dates.push(x.mutedVoice);
    });
    dates.filter(x => x).sort((a, b): number => (a.getTime()-b.getTime()));
    nextDate = dates[0];
    if(moderationService.nextScheduleJob) {
        moderationService.nextScheduleJob.cancel();
        moderationService.nextScheduleJob = undefined;
    }
    if(nextDate)
        moderationService.nextScheduleJob = schedule.scheduleJob(nextDate, punishmentSchedule);
}

export class ModerationService{
    userPunishmentService: UserPunishmentService = new UserPunishmentService();
    userProfileService: UserProfileService = new UserProfileService();
    userTimingsService: UserTimingsService = new UserTimingsService();
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();
    botlibTimings: BotlibTimings = new BotlibTimings();
    moderationEmbeds: ModerationEmbeds = new ModerationEmbeds();
    adapterAnyLeaderboard: AdapterAnyLeaderboard = new AdapterAnyLeaderboard();
    permissionsService: PermissionsService = PermissionsService.Instance;
    guildConfigService: GuildConfigService = new GuildConfigService();

    nextScheduleJob: Job | undefined;

    private static _instance: ModerationService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    async sendToSpecifyChannel(interaction: CommandInteraction, msg: MessageEmbed[]){
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(interaction.guildId);
        if(guildConfig.moderationPunishmentChannelID != null)
            try {
                let punishmentChannel: TextChannel = await interaction.guild?.channels.fetch(guildConfig.moderationPunishmentChannelID) as TextChannel;
                await punishmentChannel.send({embeds: msg});
            } catch {
                guildConfig.moderationPunishmentChannelID = null;
                await this.guildConfigService.update(guildConfig);
            }
    }

    async ban(interaction: CommandInteraction, member: GuildMember, timeType: string, timeAmount: number, reason: string){
        if(!await this.permissionsService.getUserPermissionStatus(interaction, 3))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        if(userPunishment.banned)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Пользователь уже имеет бан."), ephemeral: true});
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(interaction.guildId);
        if(guildConfig.moderationRoleBanID == null)
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Эта команда не была корректно настроена владельцем сервера.`), ephemeral: true});
        if (!await this.addRole(member, guildConfig.moderationRoleBanID)){
            guildConfig.moderationRoleBanID = null;
            await this.guildConfigService.update(guildConfig);
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Эта команда не была корректно настроена владельцем сервера.`), ephemeral: true});
        }

        let timeMs: number = this.botlibTimings.getTimeMs(timeType, timeAmount);
        userPunishment.banned = new Date(Date.now() + timeMs);
        await this.userPunishmentService.update(userPunishment);
        await updateNextScheduleJob();

        let userProfile: IUserProfile = await this.userProfileService.getOne(interaction.guildId, member.id);
        userProfile.fame = Math.max(userProfile.fame - Math.floor(timeMs/1000/3600/2), 0);
        await this.userProfileService.update(userProfile);

        let userTimings: IUserTimings = await this.userTimingsService.getOne(interaction.guildId, member.id);
        userTimings.ban = new Date();
        await this.userTimingsService.update(userTimings);

        let dateString: string = this.botlibTimings.getDateString(userPunishment.banned);
        let msg: MessageEmbed[] = [this.moderationEmbeds.ban(member.user, interaction.user, dateString, reason)];
        await interaction.reply({embeds: msg});
        await this.sendToSpecifyChannel(interaction, msg);
        await this.adapterAnyLeaderboard.update(interaction, "fame");
    }

    async banTier(interaction: CommandInteraction, member: GuildMember, reason: string){
        if(!await this.permissionsService.getUserPermissionStatus(interaction, 3))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        if(userPunishment.banned)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Пользователь уже имеет бан."), ephemeral: true});
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(interaction.guildId);
        if(guildConfig.moderationRoleBanID == null)
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Эта команда не была корректно настроена владельцем сервера.`), ephemeral: true});
        if (!await this.addRole(member, guildConfig.moderationRoleBanID)){
            guildConfig.moderationRoleBanID = null;
            await this.guildConfigService.update(guildConfig);
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Эта команда не была корректно настроена владельцем сервера.`), ephemeral: true});
        }

        let banTierDays: number[] = [
            guildConfig.moderationBanTier1,
            guildConfig.moderationBanTier2,
            guildConfig.moderationBanTier3,
            guildConfig.moderationBanTier4,
            guildConfig.moderationBanTier5,
            guildConfig.moderationBanTier6,
            guildConfig.moderationBanTier7,
            guildConfig.moderationBanTier8,
        ];
        userPunishment.banTier = Math.min(userPunishment.banTier+1, banTierDays.length);
        let timeMs: number = this.botlibTimings.getTimeMs("d", banTierDays[userPunishment.banTier-1]);
        userPunishment.banned = new Date(Date.now() + timeMs);
        await this.userPunishmentService.update(userPunishment);
        await updateNextScheduleJob();

        let userProfile: IUserProfile = await this.userProfileService.getOne(interaction.guildId, member.id);
        userProfile.fame = Math.max(userProfile.fame - Math.floor(timeMs/1000/3600/2), 0);
        await this.userProfileService.update(userProfile);

        let userTimings: IUserTimings = await this.userTimingsService.getOne(interaction.guildId, member.id);
        userTimings.ban = new Date();
        await this.userTimingsService.update(userTimings);

        let dateString: string = this.botlibTimings.getDateString(userPunishment.banned);
        let msg: MessageEmbed[] = [this.moderationEmbeds.ban(member.user, interaction.user, dateString, reason, userPunishment.banTier)];
        await interaction.reply({embeds: msg});
        await this.sendToSpecifyChannel(interaction, msg);
        await this.adapterAnyLeaderboard.update(interaction, "fame");
    }

    async mute(interaction: CommandInteraction, member: GuildMember, muteType: string, timeType: string, timeAmount: number, reason: string){
        if(!await this.permissionsService.getUserPermissionStatus(interaction, 3))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        if(muteType == "Voice")
            await this.muteVoice(interaction, member, timeType, timeAmount, reason);
        else
            await this.muteChat(interaction, member, timeType, timeAmount, reason);
        await this.adapterAnyLeaderboard.update(interaction, "fame");
    }

    private async muteVoice(interaction: CommandInteraction, member: GuildMember, timeType: string, timeAmount: number, reason: string){
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        if(userPunishment.mutedVoice)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Пользователь уже имеет блокировку в голосовых каналах."), ephemeral: true});
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(interaction.guildId);
        if(guildConfig.moderationMuteVoiceRoleID == null)
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Эта команда не была корректно настроена владельцем сервера.`), ephemeral: true});
        if (!await this.addRole(member, guildConfig.moderationMuteVoiceRoleID)){
            guildConfig.moderationRoleBanID = null;
            await this.guildConfigService.update(guildConfig);
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Эта команда не была корректно настроена владельцем сервера.`), ephemeral: true});
        }

        let timeMs: number = this.botlibTimings.getTimeMs(timeType, timeAmount);
        userPunishment.mutedVoice = new Date(Date.now() + timeMs);
        await this.userPunishmentService.update(userPunishment);
        await updateNextScheduleJob();

        let userProfile: IUserProfile = await this.userProfileService.getOne(interaction.guildId, member.id);
        userProfile.fame = Math.max(userProfile.fame - Math.round(timeMs/1000/3600), 0);
        await this.userProfileService.update(userProfile);

        let dateString: string = this.botlibTimings.getDateString(userPunishment.mutedVoice);
        let msg: MessageEmbed[] = [this.moderationEmbeds.muteVoice(member.user, interaction.user, dateString, reason)];
        await interaction.reply({embeds: msg});
        await this.sendToSpecifyChannel(interaction, msg);
    }

    private async muteChat(interaction: CommandInteraction, member: GuildMember, timeType: string, timeAmount: number, reason: string){
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        if(userPunishment.mutedChat)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Пользователь уже имеет блокировку в текстовых каналах."), ephemeral: true});
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(interaction.guildId);
        if(guildConfig.moderationMuteChatRoleID == null)
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Эта команда не была корректно настроена владельцем сервера.`), ephemeral: true});
        if(!await this.addRole(member, guildConfig.moderationMuteChatRoleID))
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Эта команда не была корректно настроена владельцем сервера.`), ephemeral: true});

        let timeMs: number = this.botlibTimings.getTimeMs(timeType, timeAmount);
        userPunishment.mutedChat = new Date(Date.now() + timeMs);
        await this.userPunishmentService.update(userPunishment);
        await updateNextScheduleJob();

        let userProfile: IUserProfile = await this.userProfileService.getOne(interaction.guildId, member.id);
        userProfile.fame = Math.max(userProfile.fame - Math.round(timeMs/1000/3600), 0);
        await this.userProfileService.update(userProfile);

        let dateString: string = this.botlibTimings.getDateString(userPunishment.mutedChat);
        let msg: MessageEmbed[] = [this.moderationEmbeds.muteChat(member.user, interaction.user, dateString, reason)];
        await interaction.reply({embeds: msg});
        await this.sendToSpecifyChannel(interaction, msg);
    }

    async unban(interaction: CommandInteraction, member: GuildMember, reason: string){
        if(!await this.permissionsService.getUserPermissionStatus(interaction, 3))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        if(!userPunishment.banned)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Данный пользователь на имеет действующего бана."), ephemeral: true});
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(interaction.guildId);
        if(guildConfig.moderationRoleBanID == null)
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Эта команда не была корректно настроена владельцем сервера.`), ephemeral: true});
        if(!await this.removeRole(member, guildConfig.moderationRoleBanID)){
            guildConfig.moderationRoleBanID = null;
            await this.guildConfigService.update(guildConfig);
            return await interaction.reply({
                embeds: this.botlibEmbeds.error(`Эта команда не была корректно настроена владельцем сервера.`),
                ephemeral: true
            });
        }

        userPunishment.banned = null;
        await this.userPunishmentService.update(userPunishment);
        let msg: MessageEmbed[] = [this.moderationEmbeds.unban(member.user, interaction.user, reason)];
        await interaction.reply({embeds: msg});
        await this.sendToSpecifyChannel(interaction, msg);
    }

    async unmute(interaction: CommandInteraction, member: GuildMember, muteType: string, reason: string){
        if(!await this.permissionsService.getUserPermissionStatus(interaction, 3))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        if(muteType == "Voice")
            await this.unmuteVoice(interaction, member, reason);
        else
            await this.unmuteChat(interaction, member, reason);
    }

    private async unmuteVoice(interaction: CommandInteraction, member: GuildMember, reason: string){
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        if(!userPunishment.mutedVoice)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Данный пользователь на имеет действующей блокировки в голосовых каналах."), ephemeral: true});
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(interaction.guildId);
        if(guildConfig.moderationMuteVoiceRoleID == null)
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Эта команда не была корректно настроена владельцем сервера.`), ephemeral: true});
        if(!await this.removeRole(member, guildConfig.moderationMuteVoiceRoleID)) {
            guildConfig.moderationMuteVoiceRoleID = null;
            await this.guildConfigService.update(guildConfig);
            return await interaction.reply({
                embeds: this.botlibEmbeds.error(`Эта команда не была корректно настроена владельцем сервера.`),
                ephemeral: true
            });
        }

        userPunishment.mutedVoice = null;
        await this.userPunishmentService.update(userPunishment);
        let msg: MessageEmbed[] = [this.moderationEmbeds.unmuteVoice(member.user, interaction.user, reason)];
        await interaction.reply({embeds: msg});
        await this.sendToSpecifyChannel(interaction, msg);
    }

    private async unmuteChat(interaction: CommandInteraction, member: GuildMember, reason: string){
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        if(!userPunishment.mutedChat)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Данный пользователь на имеет действующей блокировки в текстовых каналах."), ephemeral: true});
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(interaction.guildId);
        if(guildConfig.moderationMuteChatRoleID == null)
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Эта команда не была корректно настроена владельцем сервера.`), ephemeral: true});
        if(!await this.removeRole(member, guildConfig.moderationMuteChatRoleID)) {
            guildConfig.moderationMuteChatRoleID = null;
            await this.guildConfigService.update(guildConfig);
            return await interaction.reply({
                embeds: this.botlibEmbeds.error(`Эта команда не была корректно настроена владельцем сервера.`),
                ephemeral: true
            });
        }

        userPunishment.mutedChat = null;
        await this.userPunishmentService.update(userPunishment);
        let msg: MessageEmbed[] = [this.moderationEmbeds.unmuteChat(member.user, interaction.user, reason)];
        await interaction.reply({embeds: msg});
        await this.sendToSpecifyChannel(interaction, msg);
    }

    async unbanAuto(userPunishment: IUserPunishment){
        if(!userPunishment.banned)
            return;
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(userPunishment.guildID);
        if((guildConfig.moderationRoleBanID == null) && (guildConfig.moderationPunishmentChannelID == null))
            return;
        if((guildConfig.moderationRoleBanID == null) || (guildConfig.moderationPunishmentChannelID == null)){
            guildConfig.moderationRoleBanID = null;
            guildConfig.moderationPunishmentChannelID = null;
            return await this.guildConfigService.update(guildConfig);
        }

        userPunishment.banned = null;
        await this.userPunishmentService.update(userPunishment);
        let client: Client = ClientSingleton.Instance.client;
        let guild: Guild = await client.guilds.fetch(userPunishment.guildID);
        let msg: MessageEmbed[] = [this.moderationEmbeds.unbanAuto(userPunishment.userID)];
        let channel: TextChannel = await guild.channels.fetch(guildConfig.moderationPunishmentChannelID) as TextChannel;
        await channel.send({embeds: msg});
        try{
            let member: GuildMember = await guild.members.fetch(userPunishment.userID);
            await this.removeRole(member, guildConfig.moderationRoleBanID);
        } catch {
            return;
        }
    }

    async unmuteVoiceAuto(userPunishment: IUserPunishment){
        if(!userPunishment.mutedVoice)
            return;
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(userPunishment.guildID);
        if((guildConfig.moderationMuteVoiceRoleID == null) && (guildConfig.moderationPunishmentChannelID == null))
            return;
        if((guildConfig.moderationMuteVoiceRoleID == null) || (guildConfig.moderationPunishmentChannelID == null)){
            guildConfig.moderationMuteVoiceRoleID = null;
            guildConfig.moderationPunishmentChannelID = null;
            return await this.guildConfigService.update(guildConfig);
        }

        userPunishment.mutedVoice = null;
        await this.userPunishmentService.update(userPunishment);
        let client: Client = ClientSingleton.Instance.client;
        let guild: Guild = await client.guilds.fetch(userPunishment.guildID);
        let msg: MessageEmbed[] = [this.moderationEmbeds.unmuteVoiceAuto(userPunishment.userID)];
        let channel: TextChannel = await guild.channels.fetch(guildConfig.moderationPunishmentChannelID) as TextChannel;
        await channel.send({embeds: msg});
        try{
            let member: GuildMember = await guild.members.fetch(userPunishment.userID);
            await this.removeRole(member, guildConfig.moderationMuteVoiceRoleID);
        } catch {
            return;
        }
    }

    async unmuteChatAuto(userPunishment: IUserPunishment){
        if(!userPunishment.mutedChat)
            return;
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(userPunishment.guildID);
        if((guildConfig.moderationMuteChatRoleID == null) && (guildConfig.moderationPunishmentChannelID == null))
            return;
        if((guildConfig.moderationMuteChatRoleID == null) || (guildConfig.moderationPunishmentChannelID == null)){
            guildConfig.moderationMuteChatRoleID = null;
            guildConfig.moderationPunishmentChannelID = null;
            return await this.guildConfigService.update(guildConfig);
        }

        userPunishment.mutedChat = null;
        await this.userPunishmentService.update(userPunishment);
        let client: Client = ClientSingleton.Instance.client;
        let guild: Guild = await client.guilds.fetch(userPunishment.guildID);
        let msg: MessageEmbed[] = [this.moderationEmbeds.unmuteChatAuto(userPunishment.userID)];
        let channel: TextChannel = await guild.channels.fetch(guildConfig.moderationPunishmentChannelID) as TextChannel;
        await channel.send({embeds: msg});
        try{
            let member: GuildMember = await guild.members.fetch(userPunishment.userID);
            await this.removeRole(member, guildConfig.moderationMuteChatRoleID);
        } catch {
            return;
        }
    }

    async pardon(interaction: CommandInteraction, member: GuildMember, reason: string){
        if(!await this.permissionsService.getUserPermissionStatus(interaction, 3))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        if(!(userPunishment.banned || userPunishment.mutedChat || userPunishment.mutedVoice))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У данного пользователя нет действующих наказаний."), ephemeral: true});
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(userPunishment.guildID);
        if((guildConfig.moderationRoleBanID == null) ||
            (guildConfig.moderationMuteVoiceRoleID == null) ||
            (guildConfig.moderationMuteChatRoleID == null))
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Эта команда не была корректно настроена владельцем сервера.`), ephemeral: true});
        if( !await this.removeRole(member, guildConfig.moderationRoleBanID) ||
            !await this.removeRole(member, guildConfig.moderationMuteVoiceRoleID) ||
            !await this.removeRole(member, guildConfig.moderationMuteChatRoleID))
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Эта команда не была корректно настроена владельцем сервера.`), ephemeral: true});

        userPunishment.banned = null;
        userPunishment.mutedVoice = null;
        userPunishment.mutedChat = null;
        await this.userPunishmentService.update(userPunishment);
        let msg: MessageEmbed[] = [this.moderationEmbeds.pardon(member.user, interaction.user, reason)];
        await interaction.reply({embeds: msg});
        await this.sendToSpecifyChannel(interaction, msg);
    }

    async clear(interaction: CommandInteraction, clearAmount: number){
        if(!await this.permissionsService.getUserPermissionStatus(interaction, 3))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(interaction.guildId);
        if((clearAmount > guildConfig.moderationClearMax) || (clearAmount <= 0))
            return await interaction.reply({embeds: this.botlibEmbeds.error(`От 1 до ${guildConfig.moderationClearMax} сообщений для удаления.`), ephemeral: true});

        let channel: TextChannel = await interaction.channel as TextChannel;
        let fetchedMsg = await channel.messages.fetch({limit: clearAmount});
        await channel.bulkDelete(fetchedMsg);
        let msg: MessageEmbed[] = [this.moderationEmbeds.clear(interaction.user, clearAmount)];
        await interaction.reply({embeds: msg, ephemeral: true});
    }

    async addRole(member: GuildMember, roleID: string): Promise<boolean>{
        let role: Role|null|undefined = await member.guild?.roles.fetch(roleID);
        return (role) ? !!await member.roles.add(role) : false;
    }

    async removeRole(member: GuildMember, roleID: string): Promise<boolean>{
        let role: Role|null|undefined = await member.guild?.roles.fetch(roleID);
        return (role) ? !!await member.roles.remove(role) : false;
    }

    async checkMember(member: GuildMember){
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(member.guild.id, member.id);
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(member.guild.id);
        try{
            if((userPunishment.banned) && (guildConfig.moderationRoleBanID != null)){
                if(!await this.addRole(member, guildConfig.moderationRoleBanID)){
                    guildConfig.moderationRoleBanID = null;
                    await this.guildConfigService.update(guildConfig);
                }
            }
            if((userPunishment.mutedVoice) && (guildConfig.moderationMuteVoiceRoleID != null)){
                if(!await this.addRole(member, guildConfig.moderationMuteVoiceRoleID)){
                    guildConfig.moderationMuteVoiceRoleID = null;
                    await this.guildConfigService.update(guildConfig);
                }
            }
            if((userPunishment.mutedChat) && (guildConfig.moderationMuteChatRoleID != null)){
                if(!await this.addRole(member, guildConfig.moderationMuteChatRoleID)){
                    guildConfig.moderationMuteChatRoleID = null;
                    await this.guildConfigService.update(guildConfig);
                }
            }
        } catch {
            return;
        }
    }

    async banTierSet(interaction: CommandInteraction, member: GuildMember, banTier: number, reason: string){
        if(!await this.permissionsService.getUserPermissionStatus(interaction, 4))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(interaction.guildId);
        let banTierDays: number[] = [
            guildConfig.moderationBanTier1,
            guildConfig.moderationBanTier2,
            guildConfig.moderationBanTier3,
            guildConfig.moderationBanTier4,
            guildConfig.moderationBanTier5,
            guildConfig.moderationBanTier6,
            guildConfig.moderationBanTier7,
            guildConfig.moderationBanTier8,
        ];
        if((banTier < 0) || (banTier > banTierDays.length))
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Уровень бана от 0 до ${banTierDays.length} включительно.`), ephemeral: true});
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        if(banTier == userPunishment.banTier)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Пользователь уже имеет данный уровень."), ephemeral: true});

        let banTierBefore: number = userPunishment.banTier;
        userPunishment.banTier = banTier;
        await this.userPunishmentService.update(userPunishment);
        let msg: MessageEmbed[] = [this.moderationEmbeds.banTierSet(member.user, interaction.user, banTierBefore, banTier, reason)];
        await interaction.reply({embeds: msg});
        await this.sendToSpecifyChannel(interaction, msg);
    }

    async weakSet(interaction: CommandInteraction, member: GuildMember, weakAmount: number, reason: string){
        if(!await this.permissionsService.getUserPermissionStatus(interaction, 2))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(interaction.guildId);
        if((weakAmount < 0) || (weakAmount > guildConfig.moderationWeakPointsMax))
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Значение очков слабости от 0 до ${guildConfig.moderationWeakPointsMax}.`), ephemeral: true});

        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        let weakPointsBefore: number = userPunishment.weakPoints;
        userPunishment.weakPoints = weakAmount;
        await this.userPunishmentService.update(userPunishment);
        await interaction.reply({embeds: signEmbed(interaction, this.moderationEmbeds.weak(member.user, weakPointsBefore, userPunishment.weakPoints, guildConfig.moderationWeakPointsMax, reason))});
    }

    async weakAdd(interaction: CommandInteraction, member: GuildMember, weakAmount: number, reason: string){
        if(!await this.permissionsService.getUserPermissionStatus(interaction, 2))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        if(weakAmount == 0)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Введите целое ненулевое значение."), ephemeral: true});
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        let weakPointsBefore: number = userPunishment.weakPoints;
        userPunishment.weakPoints += weakAmount;
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(interaction.guildId);
        if((userPunishment.weakPoints < 0) || (userPunishment.weakPoints > guildConfig.moderationWeakPointsMax))
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Значение очков слабости от 0 до ${guildConfig.moderationWeakPointsMax}.`), ephemeral: true});

        await this.userPunishmentService.update(userPunishment);
        await interaction.reply({embeds: signEmbed(interaction, this.moderationEmbeds.weak(member.user, weakPointsBefore, userPunishment.weakPoints, guildConfig.moderationWeakPointsMax, reason))});
    }
}
