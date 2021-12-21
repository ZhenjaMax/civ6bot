import {CommandInteraction, Message} from "discord.js";
import {NewVote} from "./new.models";
import {BotlibEmbeds} from "../../botlib/botlib.embeds";
import {NewConfig} from "./new.config";
import {NewEmbeds} from "./new.embeds";
import {NewButtons} from "./buttons/new.buttons";

export class NewService{
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();
    newConfig: NewConfig = new NewConfig();
    newEmbeds: NewEmbeds = new NewEmbeds();
    newButtons: NewButtons = new NewButtons();
    newVoteArray: NewVote[] = [];

    private static _instance: NewService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    private async checkNew(newVote: NewVote): Promise<boolean>{
        if(newVote.users.length == 0){
            await newVote.interaction.reply({embeds: this.botlibEmbeds.error("Для выполнения этой команды вы должны находиться в голосовом канале.")});
            return false;
        }
        if(newVote.users.length < this.newConfig.newPlayersMin){
            await newVote.interaction.reply({embeds: this.botlibEmbeds.error(`Для выполнения этой команды необходимо минимум ${this.newConfig.newPlayersMin} игрока.`)});
            return false;
        }
        let currentNewVote: NewVote | undefined = this.newVoteArray.filter(x => ((x.isProcessing) && (x.guildID == newVote.interaction.guildId)))[0];
        if(currentNewVote != undefined){
            await newVote.interaction.reply({embeds: this.botlibEmbeds.error("В данный момент уже проводится голосование. Пожалуйста, подождите."), ephemeral: true});
            return false;
        }
        return true;
    }

    async getNew(interaction: CommandInteraction, type: "FFA" | "Teamers"){
        let currentNewVote = new NewVote(interaction, type);
        if(!await this.checkNew(currentNewVote))
            return;
        this.newVoteArray.push(currentNewVote);
        await interaction.reply({
            embeds: this.botlibEmbeds.notify("Успех!"),
            ephemeral: true
        });
        for(let i: number = 0; i < currentNewVote.newVoteObjects.length; i++)
            currentNewVote.messages.push(await interaction.channel?.send({
                embeds: [this.newEmbeds.voteForm(currentNewVote, i)],
                components: this.newButtons.newOptionRows(currentNewVote, i)
            }) as Message);
        currentNewVote.messages.push(await interaction.channel?.send({
            embeds: [this.newEmbeds.readyForm(currentNewVote)],
            components: this.newButtons.newPlayersRow()
        }) as Message);
    }
}
