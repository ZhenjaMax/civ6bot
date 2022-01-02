import { MessageEmbed } from "discord.js";
import { BotlibRandom } from "../../botlib/botlib.random";

export class MiscellaneousEmbeds {
    botlibRandom: BotlibRandom = new BotlibRandom();

    catImage(catURL: string): MessageEmbed {
        let catEmojis = ["😼", "😹", "🙀", "😾", "😿", "😻", "😺", "😸", "😽", "🐱", "🐈"];
        return new MessageEmbed()
            .setColor(this.botlibRandom.getRandomHexBrightString())
            .setTitle(`${catEmojis[Math.floor(Math.random()*catEmojis.length)]} Случайный кот!`)
            .setDescription("Какой же он милый!")
            .setImage(catURL)
    }

    dogImage(dogURL: string): MessageEmbed {
        let dogEmojis = ["🐶", "🦮", "🐕‍🦺", "🐕", "🐺"];
        return new MessageEmbed()
            .setColor(this.botlibRandom.getRandomHexBrightString())
            .setTitle(`${dogEmojis[Math.floor(Math.random()*dogEmojis.length)]} Случайный пёс!`)
            .setDescription("Какой же он крутой!")
            .setImage(dogURL)
    }

    avatar(avatarURL: string, avatarName: string): MessageEmbed {
        return new MessageEmbed()
            .setColor(this.botlibRandom.getRandomHexBrightString())
            .setTitle(`👤 Аватар ${avatarName}!`)
            .setImage(avatarURL);
    }

    heads(): MessageEmbed {
        return new MessageEmbed()
            .setAuthor("Подбрасывание монетки")
            .setColor("#FFB554")
            .setTitle("Орёл! 🌕")
    }

    tails(): MessageEmbed {
        return new MessageEmbed()
            .setAuthor("Подбрасывание монетки")
            .setColor("#A0A0A0")
            .setTitle("Решка! 🌑")
    }

    random(valueDiceMax: number, valueDice: number): MessageEmbed {
        return new MessageEmbed()
            .setAuthor(`Подбрасывание D${valueDiceMax}`)
            .setColor("#FF526C")
            .setTitle(`🎲 Выпало: ${valueDice}${(valueDice == valueDiceMax) ? "! 🔥" : "."}`)
    }

    vote(voteContent: string): MessageEmbed {
        return new MessageEmbed()
            .setTitle("🤔 Вопрос:")
            .setColor("#80C0C0")
            .setDescription(voteContent);
    }
}
