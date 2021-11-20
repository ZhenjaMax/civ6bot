import {CommandInteraction, MessageEmbed} from "discord.js";
import request from "request";

import {MiscellaneousEmbeds } from "./miscellaneous.embeds";
import {CatImageJSON, DogImageJSON} from "./miscellaneous.models";
import {BotlibEmbeds, SignEmbed} from "../../botlib/botlib.embeds";
import {MiscellaneousConfig} from "./miscellaneous.config";

export class MiscellaneousService {
    miscellaneousEmbeds: MiscellaneousEmbeds = new MiscellaneousEmbeds();
    miscellaneousConfig: MiscellaneousConfig = new MiscellaneousConfig();
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();

    private static _instance: MiscellaneousService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    /* Невозможно использовать декоратор @SignEmbed */
    async getRandomCat(interaction: CommandInteraction){
        await request.get(this.miscellaneousConfig.randomCatURL, async (error, response, body) => {
            let catImageInstance: CatImageJSON = JSON.parse(body.toString());
            await interaction.reply({embeds: [this.miscellaneousEmbeds.catImage(
                interaction.user, catImageInstance.file
            )]});
        });
    }

    /* Невозможно использовать декоратор @SignEmbed */
    async getRandomDog(interaction: CommandInteraction){
        request.get(this.miscellaneousConfig.randomDogURL, async (error, response, body) => {
            let dogImageInstance: DogImageJSON = JSON.parse(body.toString());
            await interaction.reply({embeds: [this.miscellaneousEmbeds.dogImage(
                interaction.user, dogImageInstance.message)]});
        });
    }

    @SignEmbed
    getRandom(interaction: CommandInteraction, n: number): MessageEmbed{
        if(n < 2 || n > 100) return this.botlibEmbeds.error("Введите целое число от 2 до 100.");
        return this.miscellaneousEmbeds.random(n, 1+Math.floor(Math.random()*n))
    }

    @SignEmbed
    flipCoin(): MessageEmbed{
        return Math.random() >= 0.5 ? this.miscellaneousEmbeds.heads() : this.miscellaneousEmbeds.tails();
    }
}
