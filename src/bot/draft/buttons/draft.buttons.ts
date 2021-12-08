import {DraftEmbedObject} from "../draft.models";
import {MessageActionRow, MessageButton} from "discord.js";
import {BotlibEmojis} from "../../../botlib/botlib.emojis";

export class DraftButtons{
    botlibEmojis: BotlibEmojis = new BotlibEmojis();
    buttonsPerRow: number = 5;

    blindPmRows(draftEmbedObject: DraftEmbedObject, userIndex: number): MessageActionRow[]{
        let rows: MessageActionRow[] = [];
        let buttonArray: MessageButton[] = [];
        for(let j: number = 0; j < draftEmbedObject.draft[userIndex].length; j++){
            buttonArray.push(new MessageButton()
                .setEmoji(draftEmbedObject.draft[userIndex][j].substring(draftEmbedObject.draft[userIndex][j].indexOf("<"), draftEmbedObject.draft[userIndex][j].indexOf(">")))
                .setLabel(draftEmbedObject.draft[userIndex][j].substring(0, draftEmbedObject.draft[userIndex][j].indexOf("<"))
                    + "—"
                    + draftEmbedObject.draft[userIndex][j].substring(draftEmbedObject.draft[userIndex][j].indexOf(">")+1, draftEmbedObject.draft[userIndex][j].length))
                .setStyle("SECONDARY")
                .setCustomId(`blindDraftButton-${j}`)
            );
            if(buttonArray.length == this.buttonsPerRow) {
                rows.push(new MessageActionRow().addComponents(buttonArray));
                buttonArray = [];
            }
        }
        if(buttonArray.length != 0)
            rows.push(new MessageActionRow().addComponents(buttonArray));
        return rows;
    }

    redraftButtons(): MessageActionRow[]{
        let rows: MessageActionRow[] = [];
        let buttonArray: MessageButton[] = [];
        buttonArray.push(
            new MessageButton()
                .setEmoji(this.botlibEmojis.yes)
                .setLabel("За")
                .setStyle("SUCCESS")
                .setCustomId("redraftButton-yes"),
            new MessageButton()
                .setEmoji(this.botlibEmojis.no)
                .setLabel("Против")
                .setStyle("DANGER")
                .setCustomId("redraftButton-no"))
        rows.push(new MessageActionRow().addComponents(buttonArray));
        return rows;
    }
}
