import {MessageEmbed} from "discord.js";

export class RoleEmbeds{
    roles(): MessageEmbed{
        return new MessageEmbed()
            .setColor("#FD91FF")
            .setTitle("👤 Выбор ролей")
            .setDescription("*Вы можете получить или убрать роль, нажимая на кнопки ниже.*");
    }
}
