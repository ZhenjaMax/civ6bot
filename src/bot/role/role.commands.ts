import {Discord, Slash, SlashGroup} from "discordx";
import {CommandInteraction} from "discord.js";
import {RoleService} from "./role.service";

@Discord()
@SlashGroup("role-manager", "Сообщение для получения ролей")
export abstract class RoleCommands{
    roleService: RoleService = RoleService.Instance;

    @Slash("create", {description: "Изменить описание профиля"})
    async create(interaction: CommandInteraction){ await this.roleService.create(interaction) }
}
