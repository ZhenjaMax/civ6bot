import {CommandInteraction} from "discord.js";
import {RoleEmbeds} from "./role.embeds";
import {RoleButtons} from "./buttons/role.buttons";
import {BotlibEmbeds} from "../../botlib/botlib.embeds";
import {PermissionsService} from "../permissions/permissions.service";

export class RoleService{
    roleEmbeds: RoleEmbeds = new RoleEmbeds();
    roleButtons: RoleButtons = new RoleButtons();
    permissionsService: PermissionsService = PermissionsService.Instance;
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();

    private static _instance: RoleService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    async create(interaction: CommandInteraction){
        if(!await this.permissionsService.getUserPermissionStatus(interaction, 5))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды!\nЕсли вы хотите получить или убрать роли, перейдите в соответствующий канал."), ephemeral: true});
        await interaction.reply({
            embeds: [this.roleEmbeds.roles()],
            components: this.roleButtons.roles()
        });
    }
}
