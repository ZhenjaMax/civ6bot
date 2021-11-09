import { CommandInteraction } from "discord.js";
import request from "request";

import {getEmbed_CatImage, getEmbed_DogImage} from "./miscellaneous.embeds";
import { catImageJSON, dogImageJSON } from "./miscellaneous.models";

export class MiscellaneousService {
    async getRandomCat(interaction: CommandInteraction){
        await request.get("https://aws.random.cat/meow", async (error, response, body) => {
            let catImageInstance: catImageJSON = JSON.parse(body.toString());
            await interaction.reply({embeds: [getEmbed_CatImage(catImageInstance.file)]});
        });
    }

    async getRandomDog(interaction: CommandInteraction){
        await request.get("https://dog.ceo/api/breeds/image/random", async (error, response, body) => {
            let dogImageInstance: dogImageJSON = JSON.parse(body.toString());
            await interaction.reply({embeds: [getEmbed_DogImage(dogImageInstance.message)]});
        });
    }
}
