import {CommandInteraction} from "discord.js";
import {NewVote} from "./new.models";
import {BotlibEmbeds} from "../../botlib/botlib.embeds";

export class NewService{
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();
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
        let currentNewVote: NewVote | undefined = this.newVoteArray.filter((x) => {return ((x.isProcessing) && (x.guildID == newVote.interaction.guildId))})[0];
        if(currentNewVote != undefined){
            await newVote.interaction.reply({embeds: this.botlibEmbeds.error("В данный момент уже проводится голосование. Пожалуйста, подождите."), ephemeral: true});
            return false;
        }
        return true;
    }

    async getNewFFA(interaction: CommandInteraction){
        let currentNewVote = new NewVote(interaction, "ffa");
        if(!await this.checkNew(currentNewVote))
            return;
        this.newVoteArray.push(currentNewVote);
    }

    async getNewTeamers(interaction: CommandInteraction){

    }
}
