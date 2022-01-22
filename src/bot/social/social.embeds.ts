import {ColorResolvable, MessageEmbed, User} from "discord.js";
import {IUserProfile} from "../../db/models/db.UserProfile";
import {IUserRating} from "../../db/models/db.UserRating";
import {IUserTimings} from "../../db/models/db.UserTimings";
import {IUserPunishment} from "../../db/models/db.UserPunishment";
import {BotlibTimings} from "../../botlib/botlib.timings";
import {BotlibEmojis} from "../../botlib/botlib.emojis";
import {ModerationConfig} from "../moderation/moderation.config";

export class SocialEmbeds{
    botlibTimings: BotlibTimings = new BotlibTimings();
    botlibEmojis: BotlibEmojis = new BotlibEmojis();
    moderationConfig: ModerationConfig = new ModerationConfig();

    bonus(bonusStreak: number, isMaxStreakFlag: boolean, moneyAdd: number, moneyTotal: number, fame: number, rating: number): MessageEmbed{
        let streakWord: string, bonusStringContent: string = "";
        switch(bonusStreak){
            case 1:
                streakWord = `${bonusStreak} день`;
                break;
            case 5:
            case 6:
            case 7:
                streakWord = (isMaxStreakFlag) ? `более ${bonusStreak} дней` : `${bonusStreak} дней`;
                break;
            default:
                streakWord = `${bonusStreak} дня`;
        }
        bonusStringContent += `**Вы получили ${moneyAdd} 🪙.**\n`;
        if(rating)
            bonusStringContent += `**Вы получили 📈 +${rating} к общему рейтингу.**\n`;
        if(fame)
            bonusStringContent += `**Вы получили 🏆 +${fame} к славе.**\n`;
        bonusStringContent += `**Ваш баланс: ${moneyTotal} 🪙.**\n\n**Вы получаете ежедневный бонус ${streakWord} подряд!**`;

        if(bonusStreak == 7)
            bonusStringContent += `${(isMaxStreakFlag) ? " 🥳\n💷 💷 💷 💷 💷 💷 💷" : " 🥳\n💵 💵 💵 💵 💵 💵"} 💸\n**Приходите завтра, чтобы сохранить накопленный бонус!**`;
        else {
            bonusStringContent += "\n";
            for(let i = 0; i < bonusStreak-1; i++)
                bonusStringContent += "💵 ";
            bonusStringContent += "💸 "
            for(let i = 0; i < 7-bonusStreak; i++)
                bonusStringContent += "🗓️ ";
            bonusStringContent += "\n**Приходите завтра и получите больше бонусов!**";
        }

        return new MessageEmbed()
            .setColor("#FFD500")
            .setTitle("😍 Ежедневный бонус")
            .setDescription(bonusStringContent);
    }

    like(user: User, total: number, isLike: boolean = true): MessageEmbed{
        return new MessageEmbed()
            .setColor("#FFD500")
            .setTitle(`${isLike ? "👍 Лайк" : "👎 Дизлайк"} для ${user.tag}!`)
            .setDescription(`Всего ${isLike ? "лайков" : "дизлайков"}: ${total}.`);
    }

    moneyPay(author: User, authorMoney: number, user: User, userMoney: number, moneyAmount: number): MessageEmbed{
        return new MessageEmbed()
            .setColor("#FFD500")
            .setTitle("💰 Изменение баланса")
            .addField("Отправитель:", author.toString(), true)
            .addField("Было:", `${authorMoney+moneyAmount}`, true)
            .addField("Стало:", `${authorMoney}`, true)
            .addField("Получатель:", user.toString(), true)
            .addField("Было:", `${userMoney-moneyAmount}`, true)
            .addField("Стало:", `${userMoney}`, true)
    }

    moneySet(user: User, moneyAmount: number, moneyDelta: number): MessageEmbed{
        return new MessageEmbed()
            .setColor("#FFD500")
            .setTitle("💰 Изменение баланса")
            .addField("Пользователь:", user.toString(), true)
            .addField("Было:", `${moneyAmount-moneyDelta} 🪙`, true)
            .addField("Стало:", `${moneyAmount} 🪙`, true)
    }

    fameSet(user: User, fameAmount: number, fameDelta: number): MessageEmbed{
        return new MessageEmbed()
            .setColor("#FFD500")
            .setTitle("🏆 Изменение славы")
            .addField("Пользователь:", user.toString(), true)
            .addField("Было:", `${fameAmount-fameDelta} 🏆`, true)
            .addField("Стало:", `${fameAmount} 🏆`, true)
    }

    profile(user: User, color: ColorResolvable, userProfile: IUserProfile, userPunishment: IUserPunishment, userRating: IUserRating): MessageEmbed{
        let punishment: string = "";
        if(userPunishment.banned != null)
            punishment += `бан до: ${this.botlibTimings.getDateString(userPunishment.banned)}\n`;
        if(userPunishment.mutedChat != null)
            punishment += `войс заблокирован до: ${this.botlibTimings.getDateString(userPunishment.mutedChat)}\n`;
        if(userPunishment.mutedVoice != null)
            punishment += `чат заблокирован до: ${this.botlibTimings.getDateString(userPunishment.mutedVoice)}\n`;

        let msg: MessageEmbed = new MessageEmbed()
            .setTitle(`👥 Профиль игрока ${user.tag}`)
            .setColor(color)
            .addField("🪙 Деньги", `${userProfile.money}`, true)
            .addField("🏆 Слава",`${userProfile.fame}`, true)
            .addField("🎩 Лайки/Дизлайки", `👍 ${userProfile.likes} / ${userProfile.dislikes} 👎`, true)
            .addField("📈 Рейтинг", `Общий: ${userRating.rating}\nFFA: ${userRating.ratingFFA}\nTeamers: ${userRating.ratingTeamers}`, true)
            .addField("🔎 Краткая статистика", `🗿 FFA: ${userRating.defeatsFFA+userRating.victoriesFFA}\n🐲 Teamers: ${userRating.defeatsTeamers+userRating.victoriesTeamers}`, true)
            .addField("🐌 Очки слабости", `${userPunishment.weakPoints} / ${this.moderationConfig.maxWeakPoints}`, true);
        if(punishment != "")
            msg.addField("🔨 Наказание", punishment);
        if(userProfile.description != "")
            msg.addField("📝 Описание", userProfile.description);
        if(userProfile.profileAvatarURL != "")
            msg.setImage(userProfile.profileAvatarURL);
        return msg;
    }

    stats(user: User, userRating: IUserRating, userTimings: IUserTimings): MessageEmbed{
        let victories: string = `${this.botlibEmojis.victoryScience}  ${userRating.victoriesScience}  |  ${this.botlibEmojis.victoryCulture}  ${userRating.victoriesCulture}
        ${this.botlibEmojis.victoryDomination}  ${userRating.victoriesDomination}  |  ${this.botlibEmojis.victoryReligious}  ${userRating.victoriesReligious}
        ${this.botlibEmojis.victoryDiplomatic}  ${userRating.victoriesDiplomatic}  |  ${this.botlibEmojis.victoryScore}  ${userRating.victoriesScore}`;

        return new MessageEmbed()
            .setTitle(`🔎 Статистика игрока ${user.tag}`)
            .setColor("#00a4c4")
            .addField("📈 Рейтинг", `Общий: ${userRating.rating}\n🗿 FFA: ${userRating.ratingFFA}\n🐲 Teamers: ${userRating.ratingTeamers}`, true)
            .addField("🏅 Побед/поражений", `Всего: ${userRating.victoriesFFA + userRating.victoriesTeamers} / ${userRating.defeatsFFA + userRating.defeatsTeamers}\n🗿 FFA: ${userRating.victoriesFFA} / ${userRating.defeatsFFA}\n🐲 Teamers: ${userRating.victoriesTeamers} / ${userRating.defeatsTeamers}`, true)
            .addField("🏆 Победы по типам", victories, true)
            .addField("🗿 Первых мест в FFA", `${userRating.firstPlaceFFA}`, true)
            .addField("🕐 Дата последней игры", (userTimings.game) ? this.botlibTimings.getDateString(userTimings.game) : "нет", true);
    }
}
