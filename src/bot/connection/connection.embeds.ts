import {MessageEmbed} from "discord.js";

export class ConnectionEmbeds{
    link(steamLobbyURL: string, isLicense: boolean, description: string): MessageEmbed{
        let embedMsg: MessageEmbed = new MessageEmbed()
            .setTitle("🌐 Ссылка на лобби")
            .setColor("#3B88C3")
            .setDescription(`${isLicense ? "👑" : "🏴‍☠️"} Лобби для ${isLicense ? "лицензионной" : "пиратской"} версии игры.\n**${steamLobbyURL}**`)
        if(description != "")
            embedMsg.addField("❗ Дополнительное описание:", "\t" + description)
        return embedMsg;
    }

    connect(): MessageEmbed{
        return new MessageEmbed()
            .setTitle("🌐 Подключение Steam")
            .setColor("#3B88C3")
            .setDescription(`Для получения ссылки на лобби вам необходимо подключить бота в вашему профилю Discord. Для этого выполните следующие шаги:
            
            1) добавьте аккаунт Steam в ваш профиль Discord (настройки -> интеграции);
            2) авторизуйте бота для получения ссылки на ваш аккаунт Steam.`);
    }
}