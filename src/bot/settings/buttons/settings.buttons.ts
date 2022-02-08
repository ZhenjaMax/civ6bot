import {MessageActionRow, MessageButton} from "discord.js";
import {BotlibEmojis} from "../../../botlib/botlib.emojis";

export class SettingsButtons{
    botlibEmojis: BotlibEmojis = new BotlibEmojis();

    settingsSetup(): MessageActionRow[]{
        let rows: MessageActionRow[] = [];
        let buttonArray: MessageButton[] = [];
        buttonArray.push(
            new MessageButton()
                .setEmoji(this.botlibEmojis.yes)
                .setLabel("Подтвердить")
                .setStyle("SUCCESS")
                .setCustomId("settings-setup-yes"),
            new MessageButton()
                .setEmoji(this.botlibEmojis.no)
                .setLabel("Отмена")
                .setStyle("DANGER")
                .setCustomId("settings-setup-no"),
        );
        rows.push(new MessageActionRow().addComponents(buttonArray));
        return rows;
    }

    settingsReset(): MessageActionRow[]{
        let rows: MessageActionRow[] = [];
        let buttonArray: MessageButton[] = [];
        buttonArray.push(
            new MessageButton()
                .setEmoji(this.botlibEmojis.yes)
                .setLabel("Подтвердить")
                .setStyle("SUCCESS")
                .setCustomId("settings-reset-yes"),
            new MessageButton()
                .setEmoji(this.botlibEmojis.no)
                .setLabel("Отмена")
                .setStyle("DANGER")
                .setCustomId("settings-reset-no"),
        );
        rows.push(new MessageActionRow().addComponents(buttonArray));
        return rows;
    }
}
