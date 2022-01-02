import {Discord, Slash, SlashOption} from "discordx";
import {CommandInteraction, GuildMember} from "discord.js";
import {MiscellaneousService} from "./miscellaneous.service";

@Discord()
export abstract class MiscellaneousCommands {
    miscellaneousService: MiscellaneousService = MiscellaneousService.Instance;

    /* Вывод изнутри Service из-за особенностей библиотеки "request"
       Есть способ лучше? */
    @Slash("cat", { description: "Случайное изображение кота" })
    async randomCat(interaction: CommandInteraction) { await this.miscellaneousService.getRandomCat(interaction); }

    /* Вывод изнутри Service из-за особенностей библиотеки "request"
       Есть способ лучше? */
    @Slash("dog", { description: "Случайное изображение собаки" })
    async randomDog(interaction: CommandInteraction) { await this.miscellaneousService.getRandomDog(interaction); }

    @Slash("random", { description: "Случайное число от 1 до n" })
    async random(
        @SlashOption("число", { type: "INTEGER", description: "Верхняя граница", required: true }) n: number,
        interaction: CommandInteraction
    ) { await this.miscellaneousService.getRandom(interaction, n); }

    @Slash("flip", { description: "Подбросить монетку"})
    async coin(interaction: CommandInteraction){ await this.miscellaneousService.flipCoin(interaction); }

    @Slash("avatar", {description: "Получить изображение профиля пользователя"})
    async avatar(
        @SlashOption("пользователь", {type: "USER", description: "по умолчанию - изображение автора"}) member: GuildMember,
        interaction: CommandInteraction
    ) { await this.miscellaneousService.getAvatar(interaction, member) }

    @Slash("vote", {description: "Запустить опрос"})
    async vote(
        @SlashOption("опрос", {type: "STRING", description: "содержание", required: true}) voteContent: string,
        interaction: CommandInteraction
    ) { await this.miscellaneousService.getVote(interaction, voteContent) }
}
