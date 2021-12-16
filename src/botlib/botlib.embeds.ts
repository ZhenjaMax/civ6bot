import {CommandInteraction, MessageEmbed} from "discord.js";

export function signEmbed(interaction: CommandInteraction, embed: MessageEmbed | MessageEmbed[]): MessageEmbed[]{
    if(!Array.isArray(embed))
        embed = [embed];
    embed[embed.length-1].setFooter(interaction.user.tag, interaction.user.avatarURL() || undefined);
    return embed;
}

export class BotlibEmbeds{
    error(errorDescription: string = "Неизвестная ошибка!"): MessageEmbed[]{
        return [new MessageEmbed()
            .setColor("#FF0000")
            .addField("Ошибка!", errorDescription)];
    }

    notify(notifyDescription: string): MessageEmbed[]{
        return [new MessageEmbed()
            .setColor("#66FF66")
            .addField("Уведомление", notifyDescription)];
    }
}
