import {MessageActionRow, MessageButton} from "discord.js";

export class SocialButtons{
    bonusRows(){
        let rows: MessageActionRow[] = [];
        let buttonArray: MessageButton[] = [];
        buttonArray.push(
            new MessageButton()
                .setEmoji("😍")
                .setLabel("Я тоже хочу бонус!")
                .setStyle("SUCCESS")
                .setCustomId(`bonus`),
        );
        rows.push(new MessageActionRow().addComponents(buttonArray));
        return rows;
    }

    profileRows(){
        let rows: MessageActionRow[] = [];
        let buttonArray: MessageButton[] = [];
        buttonArray.push(
            new MessageButton()
                .setEmoji("📈")
                .setLabel("Статистика пользователя")
                .setStyle("SECONDARY")
                .setCustomId(`profile`),
        );
        rows.push(new MessageActionRow().addComponents(buttonArray));
        return rows;
    }
}
