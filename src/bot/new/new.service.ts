import {CommandInteraction} from "discord.js";

export class NewService{
    private static _instance: NewService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    async getNewFFA(interaction: CommandInteraction){

    }

    async getNewTeamers(interaction: CommandInteraction){

    }
}
