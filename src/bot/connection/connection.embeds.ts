import {MessageEmbed} from "discord.js";

export class ConnectionEmbeds{
    link(steamLobbyURL: string, isLicense: boolean): MessageEmbed{
        return new MessageEmbed()
            .setTitle("🌐 Ссылка на лобби")
            .setColor("#3B88C3")
            .setDescription(`${isLicense ? "👑" : "🏴‍☠️"} Лобби для ${isLicense ? "лицензионной" : "пиратской"} версии игры.\n**${steamLobbyURL}**`);
    }

    connect(): MessageEmbed{
        return new MessageEmbed()
            .setTitle("🌐 Подключение Steam")
            .setColor("#3B88C3")
            .setDescription(`Для подключения выполните следующие шаги:
            
            1) добавьте аккаунт Steam в ваш профиль Discord;
            2) авторизуйте бота для получения ссылки на ваш аккаунт Steam.`);
    }
}