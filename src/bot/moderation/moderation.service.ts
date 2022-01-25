import {ButtonInteraction, Collection, CommandInteraction, Guild, GuildMember, MessageEmbed, Role, TextChannel} from "discord.js";
import {IUserPunishment, UserPunishmentService} from "../../db/models/db.UserPunishment";
import {ModerationConfig} from "./moderation.config";
import {BotlibTimings} from "../../botlib/botlib.timings";
import {BotlibEmbeds, signEmbed} from "../../botlib/botlib.embeds";
import {ModerationEmbeds} from "./moderation.embeds";
import * as schedule from "node-schedule";
import {Job} from "node-schedule";
import {ClientSingleton} from "../../client/client";
import {Client} from "discordx";
import {IUserProfile, UserProfileService} from "../../db/models/db.UserProfile";
import {IUserTimings, UserTimingsService} from "../../db/models/db.UserTimings";

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
    moderationConfig: ModerationConfig = new ModerationConfig();
    moderationEmbeds: ModerationEmbeds = new ModerationEmbeds();
    nextScheduleJob: Job | undefined;

    private static _instance: ModerationService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    //0..5 - уровень доступа: наказан, игрок, стажёр, модератор, администратор, владелец
    //Проверка на доступ: level - необходимый уровень, должен быть меньше или
    //равен уровню доступа пользователя
    getUserPermissionStatus(interaction: CommandInteraction|ButtonInteraction, needLevel: number): boolean{
        let member: GuildMember = interaction.member as GuildMember;
        let roles: Collection<string, Role> = member.roles.cache;
        let currentLevel: number = 1;

        if(member.guild.ownerId == member.id)
            currentLevel = 5;
        else if(roles.has(this.moderationConfig.roleAdministratorID))
            currentLevel = 4;
        else if(roles.has(this.moderationConfig.roleModeratorID))
            currentLevel = 3;
        else if(roles.has(this.moderationConfig.roleSupportID))
            currentLevel = 2;
        else if(roles.hasAny(this.moderationConfig.roleBanID, this.moderationConfig.roleMuteChatID, this.moderationConfig.roleMuteVoiceID))
            currentLevel = 0;
        return (currentLevel >= needLevel);
    }

    async sendToSpecifyChannel(interaction: CommandInteraction, msg: MessageEmbed[]){
        let punishmentChannel: TextChannel = await interaction.guild?.channels.fetch(this.moderationConfig.punishmentChannelID) as TextChannel;
        await punishmentChannel.send({embeds: msg});
    }

    async ban(interaction: CommandInteraction, member: GuildMember, timeType: string, timeAmount: number, reason: string){
        if(!this.getUserPermissionStatus(interaction, 3))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        if(userPunishment.banned)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Пользователь уже имеет бан."), ephemeral: true});
        let timeMs: number = this.botlibTimings.getTimeMs(timeType, timeAmount);
        userPunishment.banned = new Date(Date.now() + timeMs);
        await this.userPunishmentService.update(userPunishment);
        await updateNextScheduleJob();

        await this.addRole(member, this.moderationConfig.roleBanID);

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
    }

    async banTier(interaction: CommandInteraction, member: GuildMember, reason: string){
        if(!this.getUserPermissionStatus(interaction, 3))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        if(userPunishment.banned)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Пользователь уже имеет бан."), ephemeral: true});
        userPunishment.banTier = Math.min(userPunishment.banTier+1, this.moderationConfig.banTierDays.length-1);
        let timeMs: number = this.botlibTimings.getTimeMs("d", this.moderationConfig.banTierDays[userPunishment.banTier]);
        userPunishment.banned = new Date(Date.now() + timeMs);
        await this.userPunishmentService.update(userPunishment);
        await updateNextScheduleJob();

        await this.addRole(member, this.moderationConfig.roleBanID);

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
    }

    async mute(interaction: CommandInteraction, member: GuildMember, muteType: string, timeType: string, timeAmount: number, reason: string){
        if(!this.getUserPermissionStatus(interaction, 3))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        if(muteType == "Voice")
            return await this.muteVoice(interaction, member, timeType, timeAmount, reason);
        return await this.muteChat(interaction, member, timeType, timeAmount, reason);
    }

    private async muteVoice(interaction: CommandInteraction, member: GuildMember, timeType: string, timeAmount: number, reason: string){
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        if(userPunishment.mutedVoice)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Пользователь уже имеет блокировку в голосовых каналах."), ephemeral: true});
        let timeMs: number = this.botlibTimings.getTimeMs(timeType, timeAmount);
        userPunishment.mutedVoice = new Date(Date.now() + timeMs);
        await this.userPunishmentService.update(userPunishment);
        await updateNextScheduleJob();

        await this.addRole(member, this.moderationConfig.roleMuteVoiceID);

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
        let timeMs: number = this.botlibTimings.getTimeMs(timeType, timeAmount);
        userPunishment.mutedChat = new Date(Date.now() + timeMs);
        await this.userPunishmentService.update(userPunishment);
        await updateNextScheduleJob();

        await this.addRole(member, this.moderationConfig.roleMuteChatID);

        let userProfile: IUserProfile = await this.userProfileService.getOne(interaction.guildId, member.id);
        userProfile.fame = Math.max(userProfile.fame - Math.round(timeMs/1000/3600), 0);
        await this.userProfileService.update(userProfile);

        let dateString: string = this.botlibTimings.getDateString(userPunishment.mutedChat);
        let msg: MessageEmbed[] = [this.moderationEmbeds.muteChat(member.user, interaction.user, dateString, reason)];
        await interaction.reply({embeds: msg});
        await this.sendToSpecifyChannel(interaction, msg);
    }

    async unban(interaction: CommandInteraction, member: GuildMember, reason: string){
        if(!this.getUserPermissionStatus(interaction, 3))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        if(!userPunishment.banned)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Данный пользователь на имеет действующего бана."), ephemeral: true});
        userPunishment.banned = null;
        await this.userPunishmentService.update(userPunishment);

        await this.removeRole(member, this.moderationConfig.roleBanID);

        let msg: MessageEmbed[] = [this.moderationEmbeds.unban(member.user, interaction.user, reason)];
        await interaction.reply({embeds: msg});
        await this.sendToSpecifyChannel(interaction, msg);
    }

    async unmute(interaction: CommandInteraction, member: GuildMember, muteType: string, reason: string){
        if(!this.getUserPermissionStatus(interaction, 3))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        if(muteType == "Voice")
            return await this.unmuteVoice(interaction, member, reason);
        return await this.unmuteChat(interaction, member, reason);
    }

    private async unmuteVoice(interaction: CommandInteraction, member: GuildMember, reason: string){
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        if(!userPunishment.mutedVoice)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Данный пользователь на имеет действующей блокировки в голосовых каналах."), ephemeral: true});
        userPunishment.mutedVoice = null;
        await this.userPunishmentService.update(userPunishment);

        await this.removeRole(member, this.moderationConfig.roleMuteVoiceID);

        let msg: MessageEmbed[] = [this.moderationEmbeds.unmuteVoice(member.user, interaction.user, reason)];
        await interaction.reply({embeds: msg});
        await this.sendToSpecifyChannel(interaction, msg);
    }

    private async unmuteChat(interaction: CommandInteraction, member: GuildMember, reason: string){
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        if(!userPunishment.mutedChat)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Данный пользователь на имеет действующей блокировки в текстовых каналах."), ephemeral: true});
        userPunishment.mutedChat = null;
        await this.userPunishmentService.update(userPunishment);

        await this.removeRole(member, this.moderationConfig.roleMuteChatID);

        let msg: MessageEmbed[] = [this.moderationEmbeds.unmuteChat(member.user, interaction.user, reason)];
        await interaction.reply({embeds: msg});
        await this.sendToSpecifyChannel(interaction, msg);
    }

    async unbanAuto(userPunishment: IUserPunishment){
        if(!userPunishment.banned)
            return;
        userPunishment.banned = null;
        await this.userPunishmentService.update(userPunishment);

        let client: Client = ClientSingleton.Instance.client;
        let guild: Guild = await client.guilds.fetch(userPunishment.guildID);
        let msg: MessageEmbed[] = [this.moderationEmbeds.unbanAuto(userPunishment.userID)];
        let channel: TextChannel = await guild.channels.fetch(this.moderationConfig.punishmentChannelID) as TextChannel;
        await channel.send({embeds: msg});
        try{
            let member: GuildMember = await guild.members.fetch(userPunishment.userID);
            await this.removeRole(member, this.moderationConfig.roleBanID);
        } catch (unbanError) {
            return;
        }
    }

    async unmuteVoiceAuto(userPunishment: IUserPunishment){
        if(!userPunishment.mutedVoice)
            return;
        userPunishment.mutedVoice = null;
        await this.userPunishmentService.update(userPunishment);

        let client: Client = ClientSingleton.Instance.client;
        let guild: Guild = await client.guilds.fetch(userPunishment.guildID);
        let msg: MessageEmbed[] = [this.moderationEmbeds.unmuteVoiceAuto(userPunishment.userID)];
        let channel: TextChannel = await guild.channels.fetch(this.moderationConfig.punishmentChannelID) as TextChannel;
        await channel.send({embeds: msg});
        try{
            let member: GuildMember = await guild.members.fetch(userPunishment.userID);
            await this.removeRole(member, this.moderationConfig.roleMuteVoiceID);
        } catch (unbanError) {
            return;
        }
    }

    async unmuteChatAuto(userPunishment: IUserPunishment){
        if(!userPunishment.mutedChat)
            return;
        userPunishment.mutedChat = null;
        await this.userPunishmentService.update(userPunishment);

        let client: Client = ClientSingleton.Instance.client;
        let guild: Guild = await client.guilds.fetch(userPunishment.guildID);
        let msg: MessageEmbed[] = [this.moderationEmbeds.unmuteChatAuto(userPunishment.userID)];
        let channel: TextChannel = await guild.channels.fetch(this.moderationConfig.punishmentChannelID) as TextChannel;
        await channel.send({embeds: msg});
        try{
            let member: GuildMember = await guild.members.fetch(userPunishment.userID);
            await this.removeRole(member, this.moderationConfig.roleMuteChatID);
        } catch (unbanError) {
            return;
        }
    }

    async pardon(interaction: CommandInteraction, member: GuildMember, reason: string){
        if(!this.getUserPermissionStatus(interaction, 3))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        if(!(userPunishment.banned || userPunishment.mutedChat || userPunishment.mutedVoice))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У данного пользователя нет действующих наказаний."), ephemeral: true});
        userPunishment.banned = null;
        userPunishment.mutedVoice = null;
        userPunishment.mutedChat = null;
        await this.userPunishmentService.update(userPunishment);

        await this.removeRole(member, this.moderationConfig.roleBanID);
        await this.removeRole(member, this.moderationConfig.roleMuteVoiceID);
        await this.removeRole(member, this.moderationConfig.roleMuteChatID);

        let msg: MessageEmbed[] = [this.moderationEmbeds.pardon(member.user, interaction.user, reason)];
        await interaction.reply({embeds: msg});
        await this.sendToSpecifyChannel(interaction, msg);
    }

    async clear(interaction: CommandInteraction, clearAmount: number){
        if(!this.getUserPermissionStatus(interaction, 3))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        if(clearAmount > this.moderationConfig.clearMax)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Не более 10 сообщений."), ephemeral: true});

        let channel: TextChannel = await interaction.channel as TextChannel;
        let fetchedMsg = await channel.messages.fetch({limit: clearAmount});
        await channel.bulkDelete(fetchedMsg);

        let msg: MessageEmbed[] = [this.moderationEmbeds.clear(interaction.user, clearAmount)];
        await interaction.reply({embeds: msg, ephemeral: true});
    }

    async addRole(member: GuildMember, roleID: string){
        let role: Role|null|undefined = await member.guild?.roles.fetch(roleID);
        if(role)
            await member.roles.add(role);
    }

    async removeRole(member: GuildMember, roleID: string){
        let role: Role|null|undefined = await member.guild?.roles.fetch(roleID);
        if(role)
            await member.roles.remove(role);
    }

    async checkMember(member: GuildMember){
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(member.guild.id, member.id);
        try{
            if(userPunishment.banned)
                await this.addRole(member, this.moderationConfig.roleBanID);
            if(userPunishment.mutedVoice)
                await this.addRole(member, this.moderationConfig.roleMuteVoiceID);
            if(userPunishment.mutedChat)
                await this.addRole(member, this.moderationConfig.roleMuteChatID);
        } catch (checkError) {
            return;
        }
    }

    async banTierSet(interaction: CommandInteraction, member: GuildMember, banTier: number, reason: string){
        if(!this.getUserPermissionStatus(interaction, 4))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        if((banTier < 0) || (banTier >= this.moderationConfig.banTierDays.length))
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Уровень бана от 0 до ${this.moderationConfig.banTierDays.length-1} включительно.`), ephemeral: true});
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
        if(!this.getUserPermissionStatus(interaction, 2))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        if((weakAmount < 0) || (weakAmount > this.moderationConfig.maxWeakPoints))
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Значение очков слабости от 0 до ${this.moderationConfig.maxWeakPoints}.`), ephemeral: true});
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        let weakPointsBefore: number = userPunishment.weakPoints;
        userPunishment.weakPoints = weakAmount;

        await this.userPunishmentService.update(userPunishment);
        await interaction.reply({embeds: signEmbed(interaction, this.moderationEmbeds.weak(member.user, weakPointsBefore, userPunishment.weakPoints, reason))});
    }

    async weakAdd(interaction: CommandInteraction, member: GuildMember, weakAmount: number, reason: string){
        if(!this.getUserPermissionStatus(interaction, 2))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        if(weakAmount == 0)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Введите целое ненулевое значение."), ephemeral: true});
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(interaction.guildId, member.id);
        let weakPointsBefore: number = userPunishment.weakPoints;
        userPunishment.weakPoints += weakAmount;
        if((userPunishment.weakPoints < 0) || (userPunishment.weakPoints > this.moderationConfig.maxWeakPoints))
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Значение очков слабости от 0 до ${this.moderationConfig.maxWeakPoints}.`), ephemeral: true});

        await this.userPunishmentService.update(userPunishment);
        await interaction.reply({embeds: signEmbed(interaction, this.moderationEmbeds.weak(member.user, weakPointsBefore, userPunishment.weakPoints, reason))});
    }
}
