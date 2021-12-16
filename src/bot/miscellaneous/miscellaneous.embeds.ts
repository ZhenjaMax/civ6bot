import { MessageEmbed } from "discord.js";
import { BotlibRandom } from "../../botlib/botlib.random";

export class MiscellaneousEmbeds {
    catImage(catURL: string): MessageEmbed {
        let catEmojis = ["😼", "😹", "🙀", "😾", "😿", "😻", "😺", "😸", "😽", "🐱", "🐈"];
        return new MessageEmbed()
            .setColor(BotlibRandom.getRandomHexBrightString())
            .setTitle(`${catEmojis[Math.floor(Math.random()*catEmojis.length)]} Случайный кот!`)
            .setDescription("Какой же он милый!")
            .setImage(catURL)
    }

    dogImage(dogURL: string): MessageEmbed {
        let dogEmojis = ["🐶", "🦮", "🐕‍🦺", "🐕", "🐺"];
        return new MessageEmbed()
            .setColor(BotlibRandom.getRandomHexBrightString())
            .setTitle(`${dogEmojis[Math.floor(Math.random()*dogEmojis.length)]} Случайный пёс!`)
            .setDescription("Какой же он крутой!")
            .setImage(dogURL)
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

    random(valueDiceMax: number, valueDice: number) {
        return new MessageEmbed()
            .setAuthor(`Подбрасывание D${valueDiceMax}`)
            .setColor("#FF526C")
            .setTitle(`🎲 Выпало: ${valueDice}${(valueDice == valueDiceMax) ? "! 🔥" : "."}`)
    }
}
