import {BotlibEmojis} from "../../../botlib/botlib.emojis";
import {MessageActionRow, MessageButton} from "discord.js";

export class SplitButtons{
    botlibEmojis: BotlibEmojis = new BotlibEmojis();

    splitRow(){
        let rows: MessageActionRow[] = [];
        let buttonArray: MessageButton[] = [];
        buttonArray.push(
            new MessageButton()
                .setEmoji(this.botlibEmojis.no)
                .setLabel("Удалить (для автора и капитанов)")
                .setStyle("DANGER")
                .setCustomId("split-delete")
        );
        rows.push(new MessageActionRow().addComponents(buttonArray));
        return rows;
    }
}