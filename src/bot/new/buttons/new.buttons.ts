import {NewVote} from "../new.models";
import {MessageActionRow, MessageButton} from "discord.js";
import {NewConfig} from "../new.config";

export class NewButtons{
    newConfig: NewConfig = new NewConfig();
    buttonsPerRow: number = 5;

    newPlayersRow(){
        let rows: MessageActionRow[] = [];
        let buttonArray: MessageButton[] = [];
        buttonArray.push(new MessageButton()
            .setEmoji("⚡")
            .setLabel("Готов!")
            .setStyle("PRIMARY")
            .setCustomId(`new-ready`)
        );
        rows.push(new MessageActionRow().addComponents(buttonArray));
        return rows;
    }

    newOptionRows(newVote: NewVote, index: number){
        let rows: MessageActionRow[] = [];
        let buttonArray: MessageButton[] = [];
        let optionEmojis: string[][] = (newVote.type == "FFA") ? this.newConfig.newOptionHeadersEmojisFFA : this.newConfig.newOptionHeadersEmojisTeamers;
        for(let j: number = 0; j < newVote.newVoteObjects[index].options.length; j++){
            buttonArray.push(new MessageButton()
                .setEmoji(optionEmojis[index][j])
                .setLabel(
                    newVote.newVoteObjects[index].options[j].indexOf(" ")==-1
                    ? ""
                    : newVote.newVoteObjects[index].options[j].slice(newVote.newVoteObjects[index].options[j].indexOf(" ")+1)
                )
                .setStyle("SECONDARY")
                .setCustomId(`new-${index}-${j}`)
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
}
