import {MessageActionRow, MessageButton} from "discord.js";
import {BotlibEmojis} from "../../../botlib/botlib.emojis";

export class RatingButtons{
    botlibEmojis: BotlibEmojis = new BotlibEmojis();

    reportRows(){
        let rows: MessageActionRow[] = [];
        let buttonArray: MessageButton[] = [];
        buttonArray.push(
            new MessageButton()
                .setEmoji("🔨")
                .setLabel("Подтвердить (для модератора)")
                .setStyle("PRIMARY")
                .setCustomId(`rating-confirm`),
            new MessageButton()
                .setEmoji("🗑️")
                .setLabel("Удалить (для автора или модератора)")
                .setStyle("DANGER")
                .setCustomId("rating-cancel")
        );
        rows.push(new MessageActionRow().addComponents(buttonArray));
        return rows;
    }
}
