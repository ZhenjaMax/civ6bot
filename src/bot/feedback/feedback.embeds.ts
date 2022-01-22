import {GuildMember, MessageEmbed, User} from "discord.js";
import {FeedbackConfig} from "./feedback.config";

export class FeedbackEmbeds{
    feedbackConfig: FeedbackConfig = new FeedbackConfig();

    // Нужна ли эта команда?
    help(): MessageEmbed{
        return new MessageEmbed()
            .setTitle("ℹ️  Помощь")
            .setColor("#FD91FF")
            .setDescription(`Все команды бота и их описание перечислены при написании символа \"/\" (слеш).
            При некорректном использовании команды пользователь получит сообщение об ошибке.`)
    }

    about(): MessageEmbed{
        return new MessageEmbed()
            .setColor("#FD91FF")
            .setTitle("ℹ️ Справка")
            .setDescription(`— Все команды бота и их описание перечислены при написании символа \"/\" (слеш)
            — [ссылка на проект GitHub](${this.feedbackConfig.botGitHubURL})
            — для отзывов используйте команду \"/feedback\"
            — для связи в Discord: **ZhenjaMax#3594**`)
            .setImage(this.feedbackConfig.botImageURL)
    }

    proposal(user: User, content: string): MessageEmbed{
        return new MessageEmbed()
            .setTitle("✍ Предложение")
            .setColor("#FD91FF")
            .setDescription(content);
    }

    feedback(member: GuildMember, content: string): MessageEmbed{
        return new MessageEmbed()
            .setTitle("✍ Обратная связь")
            .setColor("#FD91FF")
            .addField("🏰 Сервер", member.guild.name, true)
            .addField("🏰 ID сервера", `${member.guild.id}`, true)
            .setDescription(content);
    }
}
