import {MessageActionRow, MessageButton} from "discord.js";
import {RoleConfig} from "../role.config";

export class RoleButtons{
    buttonsPerRow: number = 4;
    roleConfig: RoleConfig = new RoleConfig();

    roles(){
        let rows: MessageActionRow[] = [];
        let buttonArray: MessageButton[] = [];

        for(let i: number = 0; i < this.roleConfig.rolesID.length; i++){
            buttonArray.push(new MessageButton()
                .setEmoji(this.roleConfig.rolesEmojis[i])
                .setLabel(this.roleConfig.rolesName[i].slice(2))
                .setStyle(this.roleConfig.rolesStyle[i])
                .setCustomId(`roles-${i}`)
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
