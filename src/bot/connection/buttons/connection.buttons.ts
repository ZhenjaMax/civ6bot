import {MessageActionRow, MessageButton} from "discord.js";

export class ConnectionButtons{
    // Не работает - не поддерживает URI steam://
    /*
    linkButton(steamLobbyURL: string, isLicense: boolean): MessageActionRow[]{
        let rows: MessageActionRow[] = [];
        let buttonArray: MessageButton[] = [];
        buttonArray.push(
            new MessageButton()
                .setEmoji(isLicense ? "👑" : "🏴‍☠️")
                .setLabel("Подключиться!")
                .setStyle("LINK")
                .setURL(steamLobbyURL)
        );
        rows.push(new MessageActionRow().addComponents(buttonArray));
        return rows;
    }
    */
    
    connectButton(connectLinkURL: string): MessageActionRow[]{
        let rows: MessageActionRow[] = [];
        let buttonArray: MessageButton[] = [];
        buttonArray.push(
            new MessageButton()
                .setEmoji("➡️")
                .setLabel("Авторизовать")
                .setStyle("LINK")
                .setURL(connectLinkURL)
        );
        rows.push(new MessageActionRow().addComponents(buttonArray));
        return rows;
    }
}
