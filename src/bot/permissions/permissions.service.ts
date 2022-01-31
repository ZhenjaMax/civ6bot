import {ButtonInteraction, Collection, CommandInteraction, GuildMember, Role} from "discord.js";
import {PermissionsConfig} from "./permissions.config";

export class PermissionsService{
    private static _instance: PermissionsService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    permissionsConfig: PermissionsConfig = new PermissionsConfig;

    //0..5 - уровень доступа: наказан, игрок, стажёр, модератор, администратор, владелец
    //Проверка на доступ: level - необходимый уровень, должен быть меньше или
    //равен уровню доступа пользователя
    getUserPermissionStatus(interaction: CommandInteraction|ButtonInteraction, needLevel: number): boolean{
        let member: GuildMember = interaction.member as GuildMember;
        let roles: Collection<string, Role> = member.roles.cache;
        let currentLevel: number;

        if(member.guild.ownerId == member.id)
            currentLevel = 5;
        else if(roles.has(this.permissionsConfig.roleAdministratorID))
            currentLevel = 4;
        else if(roles.has(this.permissionsConfig.roleModeratorID))
            currentLevel = 3;
        else if(roles.has(this.permissionsConfig.roleSupportID))
            currentLevel = 2;
        //else if(roles.hasAny(this.moderationConfig.roleBanID, this.moderationConfig.roleMuteChatID, this.moderationConfig.roleMuteVoiceID))
        else
            currentLevel = 0;
        return (currentLevel >= needLevel);
    }
}
