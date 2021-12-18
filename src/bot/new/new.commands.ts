import {Discord, Slash, SlashGroup} from "discordx";
import {CommandInteraction} from "discord.js";
import {NewService} from "./new.service";

/*
@Discord()
@SlashGroup("new", "Голосование для начала игры")
export class NewCommands{
    newService: NewService = NewService.Instance;

    @Slash("ffa", { description: "Начало игры FFA" })
    async newFFA(interaction: CommandInteraction){ await this.newService.getNewFFA(interaction); }

    @Slash("teamers", { description: "Начало игры Teamers" })
    async newTeamers(interaction: CommandInteraction){ await this.newService.getNewTeamers(interaction); }
}
*/
