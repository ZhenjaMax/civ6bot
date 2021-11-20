import {Discord, Slash, SlashOption} from "discordx";
import {CommandInteraction} from "discord.js";
import {MiscellaneousService} from "./miscellaneous.service";

@Discord()
export abstract class MiscellaneousCommands {
    miscellaneousService: MiscellaneousService = MiscellaneousService.Instance;

    /* Вывод изнутри Service из-за особенностей библиотеки "request"
       Есть способ лучше? */
    @Slash("cat", { description: "Случайное изображение кота" })
    async randomCat(interaction: CommandInteraction) { return await this.miscellaneousService.getRandomCat(interaction); }

    /* Вывод изнутри Service из-за особенностей библиотеки "request"
       Есть способ лучше? */
    @Slash("dog", { description: "Случайное изображение собаки" })
    async randomDog(interaction: CommandInteraction) { return await this.miscellaneousService.getRandomDog(interaction); }

    @Slash("random", { description: "Случайное число от 1 до n" })
    async random(
        @SlashOption("число", { type: "INTEGER", description: "Верхняя граница", required: true }) n: number = 6,
        interaction: CommandInteraction
    ) {
        await interaction.reply( { embeds: [this.miscellaneousService.getRandom(interaction, n)] } )
    }

    @Slash("flip", { description: "Подбросить монетку"})
    async coin(interaction: CommandInteraction){
        await interaction.reply({ embeds: [this.miscellaneousService.flipCoin()] })
    }
}
