import {MessageEmbed, User} from "discord.js";
import {ModerationConfig} from "./moderation.config";

export class ModerationEmbeds{
    moderationConfig: ModerationConfig = new ModerationConfig();

    ban(user: User, author: User, banDate: string, reason: string, banTier: number = 0): MessageEmbed{
        return new MessageEmbed()
            .setTitle(`🔨 Бан${(banTier) ? ` T${banTier}` : ""}`)
            .setColor("#FF9100")
            .addField("Игрок:", user.toString(), true)
            .addField("Срок назания до:", banDate, true)
            .addField("Причина:", reason, true)
            .setFooter(`Администратор ${author.tag}`, author.avatarURL() || undefined);
    }

    unban(user: User, author: User, reason: string): MessageEmbed{
        let msg: MessageEmbed = new MessageEmbed()
            .setTitle("🔨 Разбан")
            .setColor("#FF9100")
            .addField("Игрок:", user.toString(), true)
            .setFooter(`Администратор ${author.tag}`, author.avatarURL() || undefined);
        if(reason != "")
            msg.addField("Причина:", reason, true);
        return msg;
    }

    unbanAuto(userID: string): MessageEmbed{
        return new MessageEmbed()
            .setTitle("🔨 Разбан")
            .setColor("#FF9100")
            .addField("Игрок:", `<@${userID}>`)
            .setFooter("Время наказания истекло");
    }

    muteVoice(user: User, author: User, banDate: string, reason: string): MessageEmbed{
        return new MessageEmbed()
            .setTitle("🔨 Блокировка голосовых каналов")
            .setColor("#FF9100")
            .addField("Игрок:", user.toString(), true)
            .addField("Срок назания до:", banDate, true)
            .addField("Причина:", reason, true)
            .setFooter(`Администратор ${author.tag}`, author.avatarURL() || undefined);
    }

    unmuteVoice(user: User, author: User, reason: string): MessageEmbed{
        let msg: MessageEmbed = new MessageEmbed()
            .setTitle("🔨 Разблокировка голосовых каналов")
            .setColor("#FF9100")
            .addField("Игрок:", user.toString(), true)
            .setFooter(`Администратор ${author.tag}`, author.avatarURL() || undefined);
        if(reason != "")
            msg.addField("Причина:", reason, true);
        return msg;
    }

    unmuteVoiceAuto(userID: string): MessageEmbed{
        return new MessageEmbed()
            .setTitle("🔨 Разблокировка голосовых каналов")
            .setColor("#FF9100")
            .addField("Игрок:", `<@${userID}>`)
            .setFooter("Время наказания истекло");
    }

    muteChat(user: User, author: User, banDate: string, reason: string): MessageEmbed{
        return new MessageEmbed()
            .setTitle("🔨 Блокировка текстовых каналов")
            .setColor("#FF9100")
            .addField("Игрок:", user.toString(), true)
            .addField("Срок назания до:", banDate, true)
            .addField("Причина:", reason, true)
            .setFooter(`Администратор ${author.tag}`, author.avatarURL() || undefined);
    }

    unmuteChat(user: User, author: User, reason: string): MessageEmbed{
        let msg: MessageEmbed = new MessageEmbed()
            .setTitle("🔨 Разблокировка текстовых каналов")
            .setColor("#FF9100")
            .addField("Игрок:", user.toString(), true)
            .setFooter(`Администратор ${author.tag}`, author.avatarURL() || undefined);
        if(reason != "")
            msg.addField("Причина:", reason, true);
        return msg;
    }

    unmuteChatAuto(userID: string): MessageEmbed{
        return new MessageEmbed()
            .setTitle("🔨 Разблокировка текстовых каналов")
            .setColor("#FF9100")
            .addField("Игрок:", `<@${userID}>`)
            .setFooter("Время наказания истекло");
    }

    pardon(user: User, author: User, reason: string): MessageEmbed{
        let msg: MessageEmbed = new MessageEmbed()
            .setTitle("🔨 Все ограничения сняты!")
            .setColor("#FF9100")
            .addField("Игрок:", user.toString(), true)
            .setFooter(`Администратор ${author.tag}`, author.avatarURL() || undefined);
        if(reason != "")
            msg.addField("Причина:", reason, true);
        return msg;
    }

    clear(author: User, messageCount: number){
        return new MessageEmbed()
            .setTitle("🔨 Удаление сообщений")
            .setColor("#FF9100")
            .setDescription(`✏️ Удалено сообщений: ${messageCount}. 📝`);
    }

    banTierSet(user: User, author: User, banTierBefore: number, banTierAfter: number, reason: string): MessageEmbed{
        let msg: MessageEmbed = new MessageEmbed()
            .setTitle("🔨 Изменение уровня бана")
            .setColor("#FF9100")
            .addField("Игрок:", user.toString(), true)
            .addField("Изменение:", `T${banTierBefore} => T${banTierAfter}`, true);
        if(reason != "")
            msg.addField("Причина:", reason, true);
        return msg;
    }

    weak(user: User, weakAmountBefore: number, weakAmountAfter: number, reason: string): MessageEmbed{
        let msg: MessageEmbed = new MessageEmbed()
            .setTitle("🐌 Изменение очков слабости")
            .setColor("#FF9100")
            .addField("Игрок:", user.toString(), true)
            .addField("Значение:", `${weakAmountBefore}/${this.moderationConfig.maxWeakPoints} => ${weakAmountAfter}/${this.moderationConfig.maxWeakPoints}`, true);
        if(reason != "")
            msg.addField("Причина:", reason, true);
        return msg;
    }
}
