import {ButtonInteraction, CommandInteraction, GuildMember, Message} from "discord.js";
import {IUserTimings, UserTimingsService} from "../../db/models/db.UserTimings";
import {IUserProfile, UserProfileService} from "../../db/models/db.UserProfile";
import {BotlibEmbeds, signEmbed} from "../../botlib/botlib.embeds";
import {BotlibTimings} from "../../botlib/botlib.timings";
import {SocialConfig} from "./social.config";
import {SocialEmbeds} from "./social.embeds";
import {SocialButtons} from "./buttons/social.buttons";
import {IUserRating, UserRatingService} from "../../db/models/db.UserRating";
import {ModerationService} from "../moderation/moderation.service";
import {IUserPunishment, UserPunishmentService} from "../../db/models/db.UserPunishment";
import {IProfileMessagePair} from "./social.models";
import {RatingConfig} from "../rating/rating.config";

export class SocialService{
    userTimingsService: UserTimingsService = new UserTimingsService();
    userProfileService: UserProfileService = new UserProfileService();
    userRatingService: UserRatingService = new UserRatingService();
    userPunishmentService: UserPunishmentService = new UserPunishmentService();
    socialConfig: SocialConfig = new SocialConfig();
    socialEmbeds: SocialEmbeds = new SocialEmbeds();
    socialButtons: SocialButtons = new SocialButtons();
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();
    botlibTimings: BotlibTimings = new BotlibTimings();
    moderationService: ModerationService = ModerationService.Instance;
    ratingConfig: RatingConfig = new RatingConfig();

    profileMessages: IProfileMessagePair[] = [];

    private static _instance: SocialService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    async bonus(interaction: CommandInteraction | ButtonInteraction){
        let member: GuildMember = interaction.member as GuildMember;
        let userTimings: IUserTimings = await this.userTimingsService.getOne(member.guild.id, member.id);


        let deltaDays: number = 1;
        if(userTimings.bonus) {
            deltaDays = this.botlibTimings.getDaysDifference(userTimings.bonus);
            if(deltaDays == 0)
                return await interaction.reply({embeds: this.botlibEmbeds.error(`Вы уже получили бонус сегодня.\nСледующий бонус будет доступен через ${this.botlibTimings.getTimeToNextDayString()}.`), ephemeral: true});
        }

        let userProfile: IUserProfile = await this.userProfileService.getOne(member.guild.id, member.id);
        let userRating: IUserRating = await this.userRatingService.getOne(member.guild.id, member.id);

        let isMaxBonusStreak: boolean = (userProfile.bonusStreak == this.socialConfig.maxBonusStreak);
        userProfile.bonusStreak = (deltaDays == 1) ? Math.min(userProfile.bonusStreak+1, this.socialConfig.maxBonusStreak) : 1;
        userTimings.bonus = new Date();
        let money: number = Math.round(this.socialConfig.moneyBase*(userProfile.bonusStreak + Math.log10(userProfile.fame+1) + Math.random() - 0.5));
        let fame: number = (isMaxBonusStreak)
            ? ((Math.random() < this.socialConfig.fameChancePremium)
                ? this.socialConfig.famePremium
                : this.socialConfig.fameBase)
            : ((Math.random() < this.socialConfig.fameChanceBase*userProfile.bonusStreak)
                ? this.socialConfig.fameBase
                : 0);
        let rating: number = (Math.random() < this.socialConfig.ratingChanceBase*userProfile.bonusStreak)
            ? this.socialConfig.ratingBase
            : 0;
        userProfile.money += money;
        userProfile.fame += fame;
        userRating.rating += rating;

        await this.userTimingsService.update(userTimings);
        await this.userProfileService.update(userProfile);
        if(rating)
            await this.userRatingService.update(userRating);
        return await interaction.reply({
            embeds: signEmbed(interaction, this.socialEmbeds.bonus(userProfile.bonusStreak, isMaxBonusStreak, money, userProfile.money, fame, rating)),
            components: this.socialButtons.bonusRows()
        });
    }

    async like(interaction: CommandInteraction, member: GuildMember){
        let authorMember: GuildMember = interaction.member as GuildMember;
        if(authorMember.id == member.id)
            return interaction.reply({embeds: this.botlibEmbeds.error("Вы не можете лайкнуть себя."), ephemeral: true});
        let authorUserTimings: IUserTimings = await this.userTimingsService.getOne(authorMember.guild.id, authorMember.id);
        if(authorUserTimings.like)
            if(this.botlibTimings.getDaysDifference(authorUserTimings.like) == 0)
                return interaction.reply({embeds: this.botlibEmbeds.error(`Вы уже ставили лайк сегодня! Следующий будет доступен через ${this.botlibTimings.getTimeToNextDayString()}.`), ephemeral: true});

        authorUserTimings.like = new Date();
        let userProfile: IUserProfile = await this.userProfileService.getOne(member.guild.id, member.id);
        userProfile.likes += 1;
        userProfile.fame += 1;
        await this.userTimingsService.update(authorUserTimings);
        await this.userProfileService.update(userProfile);
        await interaction.reply({embeds: signEmbed(interaction, this.socialEmbeds.like(member.user, userProfile.likes))});
    }

    async dislike(interaction: CommandInteraction, member: GuildMember){
        let authorMember: GuildMember = interaction.member as GuildMember;
        if(authorMember.id == member.id)
            return interaction.reply({embeds: this.botlibEmbeds.error("Вы не можете дизлайкнуть себя."), ephemeral: true});
        let authorUserTimings: IUserTimings = await this.userTimingsService.getOne(authorMember.guild.id, authorMember.id);
        if(authorUserTimings.dislike)
            if(this.botlibTimings.getDaysDifference(authorUserTimings.dislike) == 0)
                return interaction.reply({embeds: this.botlibEmbeds.error(`Вы уже ставили дизлайк сегодня! Следующий будет доступен через ${this.botlibTimings.getTimeToNextDayString()}.`), ephemeral: true});

        let authorUserProfile: IUserProfile = await this.userProfileService.getOne(authorMember.guild.id, authorMember.id);
        if(authorUserProfile.fame < this.socialConfig.fameForDislikeMin)
            return interaction.reply({embeds: this.botlibEmbeds.error(`Для использования этой команды необходимо минимум ${this.socialConfig.fameForDislikeMin} 🏆 славы.`), ephemeral: true});

        authorUserTimings.dislike = new Date();
        authorUserProfile.fame -= 1;
        let userProfile: IUserProfile = await this.userProfileService.getOne(member.guild.id, member.id);
        userProfile.dislikes += 1;
        userProfile.fame = Math.min(userProfile.fame-1, 0);
        await this.userTimingsService.update(authorUserTimings);
        await this.userProfileService.updateFromArray([userProfile, authorUserProfile]);
        await interaction.reply({embeds: signEmbed(interaction, this.socialEmbeds.like(member.user, userProfile.dislikes, false))});
    }

    async moneyPay(interaction: CommandInteraction, member: GuildMember, moneyAmount: number){
        if(moneyAmount <= 0)
            await interaction.reply({embeds: this.botlibEmbeds.error("Введите целое число больше 0."), ephemeral: true});
        let authorMember: GuildMember = interaction.member as GuildMember;
        if(authorMember.id == member.id)
            await interaction.reply({embeds: this.botlibEmbeds.error("Нельзя передавать деньги самому себе."), ephemeral: true});
        let authorUserProfile: IUserProfile = await this.userProfileService.getOne(authorMember.guild.id, authorMember.id);
        if(authorUserProfile.money < moneyAmount)
            await interaction.reply({embeds: this.botlibEmbeds.error(`У вас нет столько денег!\n\nВы хотите передать: ${moneyAmount} 🪙.\nВаш баланс: ${authorUserProfile.money} 🪙.`), ephemeral: true});

        let userProfile: IUserProfile = await this.userProfileService.getOne(member.guild.id, member.id);
        authorUserProfile.money -= moneyAmount;
        userProfile.money += moneyAmount;
        await this.userProfileService.updateFromArray([userProfile, authorUserProfile]);
        await interaction.reply({embeds: signEmbed(interaction, this.socialEmbeds.moneyPay(authorMember.user, authorUserProfile.money, member.user, userProfile.money, moneyAmount))})
    }

    async moneySet(interaction: CommandInteraction, member: GuildMember, moneyAmount: number){
        if(!this.moderationService.getUserPermissionStatus(interaction, 4))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        if(moneyAmount <= 0)
            await interaction.reply({embeds: this.botlibEmbeds.error("Введите целое число больше 0."), ephemeral: true});

        let userProfile: IUserProfile = await this.userProfileService.getOne(member.guild.id, member.id);
        let moneyDelta: number = moneyAmount-userProfile.money;
        userProfile.money = moneyAmount;
        await this.userProfileService.update(userProfile);
        await interaction.reply({embeds: signEmbed(interaction, this.socialEmbeds.moneySet(member.user, userProfile.money, moneyDelta))});
    }

    async moneyAdd(interaction: CommandInteraction, member: GuildMember, moneyDelta: number){
        if(!this.moderationService.getUserPermissionStatus(interaction, 4))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        let userProfile: IUserProfile = await this.userProfileService.getOne(member.guild.id, member.id);

        userProfile.money += moneyDelta;
        if(userProfile.money < 0)
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Количество денег не может быть отрицательным.\nБаланс пользователя: ${userProfile.money-moneyDelta} 🪙.`), ephemeral: true});

        await this.userProfileService.update(userProfile);
        await interaction.reply({embeds: signEmbed(interaction, this.socialEmbeds.moneySet(member.user, userProfile.money, moneyDelta))});
    }

    async profile(interaction: CommandInteraction, member: GuildMember){
        let userProfile: IUserProfile = await this.userProfileService.getOne(member.guild.id, member.id);
        let userPunishment: IUserPunishment = await this.userPunishmentService.getOne(member.guild.id, member.id);
        let userRating: IUserRating = await this.userRatingService.getOne(member.guild.id, member.id);

        let profileMessagePair: IProfileMessagePair|undefined = this.profileMessages.filter(x => (x.message.guildId == interaction.guildId))[0];
        let newProfileMessagePair: IProfileMessagePair = {
            message: await interaction.reply({
                embeds: signEmbed(interaction, this.socialEmbeds.profile(member.user, this.socialConfig.colorList[this.ratingConfig.roleRanksValue.filter(x => userRating.rating >= x).length], userProfile, userPunishment, userRating)),
                components: this.socialButtons.profileRows(),
                fetchReply: true
            }) as Message,
            member: member
        }
        if(profileMessagePair)
            this.profileMessages[this.profileMessages.indexOf(profileMessagePair)] = newProfileMessagePair;
        else
            this.profileMessages.push(newProfileMessagePair);
    }

    async profileDescription(interaction: CommandInteraction, description: string){
        if(description.length > this.socialConfig.descriptionMaxLength)
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Превышена максимальная длина описания профиля.\nВы ввели ${description.length} символов, максимальная длина - ${this.socialConfig.descriptionMaxLength}.`), ephemeral: true});
        let userProfile: IUserProfile = await this.userProfileService.getOne(interaction.guildId, interaction.user.id);
        userProfile.description = description;
        await this.userProfileService.update(userProfile);
        await interaction.reply({embeds: this.botlibEmbeds.notify(`📝 Описание профиля было успешно ${description.length == 0 ? "сброшено" : "изменено"}.`), ephemeral: true});
    }

    async profileImage(interaction: CommandInteraction, imageURL: string){
        if(imageURL.length > this.socialConfig.imageURLMaxLength)
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Превышена максимальная длина ссылки на изображение профиля.\nВы ввели ${imageURL.length} символов, максимальная длина - ${this.socialConfig.imageURLMaxLength}.`), ephemeral: true});
        if((imageURL.length > 0) && !imageURL.match(/^.+\.((jpg)|(png)|(gif)|(jpeg))$/))
            return await interaction.reply({embeds: this.botlibEmbeds.error("Введеная ссылка не ведет на изображение.\nВ конце ссылки должен содержаться один из следующих форматов изображения: *gif, png, jpg, jpeg*."), ephemeral: true});

        let userProfile: IUserProfile = await this.userProfileService.getOne(interaction.guildId, interaction.user.id);
        userProfile.profileAvatarURL = imageURL;
        await this.userProfileService.update(userProfile);
        await interaction.reply({embeds: this.botlibEmbeds.notify(`🏞️ Изображение профиля было успешно ${imageURL.length == 0 ? "сброшено" : "изменено"}.`), ephemeral: true});
    }

    async fameSet(interaction: CommandInteraction, member: GuildMember, fameAmount: number){
        if(!this.moderationService.getUserPermissionStatus(interaction, 4))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        if(fameAmount <= 0)
            await interaction.reply({embeds: this.botlibEmbeds.error("Введите целое число больше 0."), ephemeral: true});

        let userProfile: IUserProfile = await this.userProfileService.getOne(member.guild.id, member.id);
        let fameDelta: number = fameAmount-userProfile.fame;
        userProfile.fame = fameAmount;
        await this.userProfileService.update(userProfile);
        await interaction.reply({embeds: signEmbed(interaction, this.socialEmbeds.fameSet(member.user, userProfile.fame, fameDelta))});
    }

    async fameAdd(interaction: CommandInteraction, member: GuildMember, fameDelta: number){
        if(!this.moderationService.getUserPermissionStatus(interaction, 4))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        let userProfile: IUserProfile = await this.userProfileService.getOne(member.guild.id, member.id);

        userProfile.fame += fameDelta;
        if(userProfile.money < 0)
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Количество славы не может быть отрицательным.\nСлава пользователя: ${userProfile.fame-fameDelta} 🏆.`), ephemeral: true});

        await this.userProfileService.update(userProfile);
        await interaction.reply({embeds: signEmbed(interaction, this.socialEmbeds.fameSet(member.user, userProfile.fame, fameDelta))});
    }
}
