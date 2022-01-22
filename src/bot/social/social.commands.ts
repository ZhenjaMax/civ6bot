import {Discord, Slash, SlashGroup, SlashOption} from "discordx";
import {SocialService} from "./social.service";
import {CommandInteraction, GuildMember} from "discord.js";

@Discord()
export abstract class SocialCommands{
    socialService: SocialService = SocialService.Instance;

    @Slash("bonus", {description: "Получить ежедневный бонус"})
    async bonus(interaction: CommandInteraction){ await this.socialService.bonus(interaction) }

    @Slash("like", {description: "Похвалить другого игрока"})
    async like(
        @SlashOption("игрок", { description: "игрок, которому добавится лайк", required: true, type: "USER"}) member: GuildMember,
        interaction: CommandInteraction
    ) { await this.socialService.like(interaction, member) }

    @Slash("dislike", {description: "Дизлайкнуть другого игрока"})
    async dislike(
        @SlashOption("игрок", { description: "игрок, которому добавится дизлайк", required: true, type: "USER"}) member: GuildMember,
        interaction: CommandInteraction
    ) { await this.socialService.dislike(interaction, member) }

    @Slash("profile", {description: "Показать профиль пользователя"})
    async profile(
        @SlashOption("игрок", { description: "профиль игрока", required: false, type: "USER"}) member: GuildMember | undefined,
        interaction: CommandInteraction
    ) { await this.socialService.profile(interaction, (member) ? member : interaction.member as GuildMember) }
}

@Discord()
@SlashGroup("profile-set", "Редактирование профиля")
export abstract class SocialCommandsProfile{
    socialService: SocialService = SocialService.Instance;

    @Slash("description", {description: "Изменить описание профиля"})
    async profileDescription(
        @SlashOption("содержание", { required: false, type: "STRING" }) description: string = "",
        interaction: CommandInteraction
    ){ await this.socialService.profileDescription(interaction, description) }

    @Slash("image", {description: "Изменить изображение в профиле"})
    async profileImage(
        @SlashOption("ссылка-на-изображение", { required: false, type: "STRING" }) imageURL: string = "",
        interaction: CommandInteraction
    ){ await this.socialService.profileImage(interaction, imageURL) }

}

@Discord()
@SlashGroup("money", "Передача и начисление денег")
export abstract class SocialCommandsMoney{
    socialService: SocialService = SocialService.Instance;

    @Slash("pay", {description: "Передать деньги другому игроку"})
    async moneyPay(
        @SlashOption("игрок", { description: "игрок, которому вы хотите перевести деньги", required: true, type: "USER"}) member: GuildMember,
        @SlashOption("количество", {description: "количество денег", required: true}) moneyAmount: number,
        interaction: CommandInteraction
    ) { await this.socialService.moneyPay(interaction, member, moneyAmount) }

    @Slash("set", {description: "Изменить баланс другого игрока"})
    async moneySet(
        @SlashOption("игрок", { description: "игрок, которому вы хотите перевести деньги", required: true, type: "USER"}) member: GuildMember,
        @SlashOption("количество", {description: "количество денег", required: true}) moneyAmount: number,
        interaction: CommandInteraction
    ) { await this.socialService.moneySet(interaction, member, moneyAmount) }

    @Slash("add", {description: "Добавить деньги другому игроку"})
    async moneyAdd(
        @SlashOption("игрок", { description: "игрок, которому вы хотите перевести деньги", required: true, type: "USER"}) member: GuildMember,
        @SlashOption("количество", {description: "количество денег", required: true}) moneyAmount: number,
        interaction: CommandInteraction
    ) { await this.socialService.moneyAdd(interaction, member, moneyAmount) }
}

@Discord()
@SlashGroup("fame", "Начисление славы")
export abstract class SocialCommandsFame{
    socialService: SocialService = SocialService.Instance;

    @Slash("set", {description: "Изменить славу другого игрока"})
    async moneySet(
        @SlashOption("игрок", { description: "игрок, которому вы хотите перевести деньги", required: true, type: "USER"}) member: GuildMember,
        @SlashOption("количество", {description: "количество славы", required: true}) fameAmount: number,
        interaction: CommandInteraction
    ) { await this.socialService.fameSet(interaction, member, fameAmount) }

    @Slash("add", {description: "Добавить славу другому игроку"})
    async fameAdd(
        @SlashOption("игрок", { description: "игрок, которому вы хотите перевести деньги", required: true, type: "USER"}) member: GuildMember,
        @SlashOption("количество", {description: "количество славы", required: true}) moneyAmount: number,
        interaction: CommandInteraction
    ) { await this.socialService.fameAdd(interaction, member, moneyAmount) }
}
