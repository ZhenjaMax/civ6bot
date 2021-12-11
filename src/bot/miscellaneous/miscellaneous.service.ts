import {CommandInteraction, MessageEmbed} from "discord.js";
const fetch = require('node-fetch');

import {MiscellaneousEmbeds } from "./miscellaneous.embeds";
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
        let catData = await fetch(this.miscellaneousConfig.randomCatURL);
        catData = await catData.json();
        let catURL: string = (Math.random() < 0.01) ? "https://i.imgur.com/9Wpk54U.png" : catData.file;
        await interaction.reply({embeds: [this.miscellaneousEmbeds.catImage(interaction.user, catURL)]});
    }

    /* Невозможно использовать декоратор @SignEmbed */
    async getRandomDog(interaction: CommandInteraction){
        let dogData = await fetch(this.miscellaneousConfig.randomDogURL);
        dogData = await dogData.json();
        let dogURL: string = dogData.message;
        await interaction.reply({embeds: [this.miscellaneousEmbeds.dogImage(interaction.user, dogURL)]});
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
