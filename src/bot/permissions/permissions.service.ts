import {ButtonInteraction, Collection, CommandInteraction, GuildMember, Role} from "discord.js";
import {GuildConfigService, IGuildConfig} from "../../db/models/db.GuildConfig";

export class PermissionsService{
    guildConfigService: GuildConfigService = new GuildConfigService();

    private static _instance: PermissionsService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    //0..5 - уровень доступа: наказан, игрок, стажёр, модератор, администратор, владелец
    //Проверка на доступ: level - необходимый уровень, должен быть меньше или
    //равен уровню доступа пользователя
    async getUserPermissionStatus(interaction: CommandInteraction|ButtonInteraction, needLevel: number): Promise<boolean>{
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(interaction.guildId);
        let member: GuildMember = interaction.member as GuildMember;
        let roles: Collection<string, Role> = member.roles.cache;
        let currentLevel: number = 1;

        if(member.guild.ownerId == member.id)
            currentLevel = 5;
        else if(guildConfig.moderationAdministratorRoleID && (roles.has(guildConfig.moderationAdministratorRoleID)))
            currentLevel = 4;
        else if(guildConfig.moderationModeratorRoleID && (roles.has(guildConfig.moderationModeratorRoleID)))
            currentLevel = 3;
        else if(guildConfig.moderationSupportRoleID && (roles.has(guildConfig.moderationSupportRoleID)))
            currentLevel = 2;
        else if(guildConfig.moderationRoleBanID && (roles.has(guildConfig.moderationRoleBanID)))
            currentLevel = 0;
        else if(guildConfig.moderationMuteVoiceRoleID && (roles.has(guildConfig.moderationMuteVoiceRoleID)))
            currentLevel = 0;
        else if(guildConfig.moderationMuteChatRoleID && (roles.has(guildConfig.moderationMuteChatRoleID)))
            currentLevel = 0;
        return (currentLevel >= needLevel);
    }
}
