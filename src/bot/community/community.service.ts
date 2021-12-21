import {CommandInteraction, MessageEmbed} from "discord.js";
import {CommunityEmbeds} from "./community.embeds";
import {BotlibEmbeds, signEmbed} from "../../botlib/botlib.embeds";

export class CommunityService{
    communityEmbeds: CommunityEmbeds = new CommunityEmbeds();
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();

    private static _instance: CommunityService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    async getRule(interaction: CommandInteraction, type: string){
        let msg: MessageEmbed;
        switch(type){
            case "scrap":
                msg = this.communityEmbeds.scrap();
                break;
            case "irrelevant":
                msg = this.communityEmbeds.irrelevant();
                break;
            case "remap":
                msg = this.communityEmbeds.remap();
                break;
            case "leave":
                msg = this.communityEmbeds.remap();
                break;
            case "veto":
                msg = this.communityEmbeds.veto();
                break;
            case "tie":
                msg = this.communityEmbeds.tie();
                break;
            case "sub":
                msg = this.communityEmbeds.sub();
                break;
            case "cc":
                msg = this.communityEmbeds.cc();
                break;
            default:
                msg = this.botlibEmbeds.error("Некорректное значение пункта правил.")[0];
                break;
        }
        await interaction.reply({embeds: signEmbed(interaction, msg)});
    }
}
