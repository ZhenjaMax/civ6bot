import {Discord, Slash} from "discordx";
import {CommandInteraction} from "discord.js";
import { MiscellaneousService } from "./miscellaneous.service";

@Discord()
export abstract class MiscellaneousCommands {
    miscellaneousService: MiscellaneousService = new MiscellaneousService();
    @Slash("cat", { description: "Случайное изображение кота" })
    async randomCat(interaction: CommandInteraction) { return await this.miscellaneousService.getRandomCat(interaction); }

    @Slash("dog", { description: "Случайное изображение собаки" })
    async randomDog(interaction: CommandInteraction) { return await this.miscellaneousService.getRandomDog(interaction); }
}
