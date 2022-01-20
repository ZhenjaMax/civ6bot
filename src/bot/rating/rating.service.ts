import {ButtonInteraction, CommandInteraction, GuildMember, MessageEmbed, Role, TextChannel} from "discord.js";
import {RatingObject} from "./rating.models";
import {BotlibEmbeds} from "../../botlib/botlib.embeds";
import {IRatingNote, RatingNoteService} from "../../db/models/db.RatingNote";
import {IUserRating, UserRatingService} from "../../db/models/db.UserRating";
import {IUserProfile, UserProfileService} from "../../db/models/db.UserProfile";
import {IUserTimings, UserTimingsService} from "../../db/models/db.UserTimings";
import {RatingConfig} from "./rating.config";
import {RatingEmbeds} from "./rating.embeds";
import {ModerationService} from "../moderation/moderation.service";
import {BotlibEmojis} from "../../botlib/botlib.emojis";
import {RatingButtons} from "./buttons/rating.buttons";
import * as schedule from "node-schedule";
import {BotlibTimings} from "../../botlib/botlib.timings";

export async function clearReports(): Promise<void>{
    let ratingService: RatingService = RatingService.Instance;
    let ratingObject: RatingObject;
    for(let i: number = 0; i < ratingService.ratingReports.length; i++)
        if(Date.now()-ratingService.ratingReports[i].date.getTime() >= 1000*60*60*24){
            ratingObject = ratingService.ratingReports.splice(i, 1)[0];
            i--;
            try{
                await ratingObject.message?.delete();
            } catch (clearReportError) {}
        }
}

export class RatingService{
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();
    botlibEmojis: BotlibEmojis = new BotlibEmojis();
    botlibTimings: BotlibTimings = new BotlibTimings();
    ratingConfig: RatingConfig = new RatingConfig();
    ratingNoteService: RatingNoteService = new RatingNoteService();
    userRatingService: UserRatingService = new UserRatingService();
    userProfileService: UserProfileService = new UserProfileService();
    userTimingsService: UserTimingsService = new UserTimingsService();
    ratingEmbeds: RatingEmbeds = new RatingEmbeds();
    ratingButtons: RatingButtons = new RatingButtons();
    moderationService: ModerationService = ModerationService.Instance;      // убрать потом???

    ratingReports: RatingObject[] = [];

    private static _instance: RatingService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    async updateRole(member: GuildMember, rating: number){
        let roleIndex: number = 0;
        for (let value of this.ratingConfig.roleRanksValue)
            if (value <= rating)
                roleIndex++;
        for (let i: number = 0; i < this.ratingConfig.roleRanksID.length; i++)
            if ((i != roleIndex) && (member.roles.cache.has(this.ratingConfig.roleRanksID[i])))
                await member.roles.remove(member.roles.cache.get(this.ratingConfig.roleRanksID[i]) as Role);
        if (!member.roles.cache.has(this.ratingConfig.roleRanksID[roleIndex]))
            await member.roles.add(await member.guild.roles.fetch(this.ratingConfig.roleRanksID[roleIndex]) as Role);
    }

    protected applyObjects(ratingObject: RatingObject, userRatingsConcat: IUserRating[], userProfilesConcat: IUserProfile[], usersTimingsConcat: IUserTimings[], add: boolean = true){
        let ratingNotesConcat: IRatingNote[] = ratingObject.ratingNotes.concat(ratingObject.ratingNotesSub);
        let multiplier: number = (add) ? 1 : -1;
        let currentDate: Date = new Date();

        for(let i: number = 0; i < userRatingsConcat.length; i++){
            userRatingsConcat[i].rating += ratingNotesConcat[i].rating*multiplier;
            if(ratingObject.gameType == 1) {    // Teamers
                userRatingsConcat[i].ratingTeamers += ratingNotesConcat[i].ratingTyped * multiplier;
                if(ratingNotesConcat[i].ratingTyped >= 0)
                    userRatingsConcat[i].victoriesTeamers += multiplier;
                else
                    userRatingsConcat[i].defeatsTeamers += multiplier;
            } else {                            // FFA
                userRatingsConcat[i].ratingFFA += ratingNotesConcat[i].ratingTyped * multiplier;
                if(ratingNotesConcat[i].ratingTyped >= 0)
                    userRatingsConcat[i].victoriesFFA += multiplier;
                else
                    userRatingsConcat[i].defeatsFFA += multiplier;
                if(ratingObject.winners.indexOf(i) != -1)
                    userRatingsConcat[i].firstPlaceFFA += multiplier
            }
            if(ratingNotesConcat[i].victoryType > 0){
                switch(ratingNotesConcat[i].victoryType){
                    case 1:
                        userRatingsConcat[i].victoriesScience += multiplier;
                        break;
                    case 2:
                        userRatingsConcat[i].victoriesCulture += multiplier;
                        break;
                    case 3:
                        userRatingsConcat[i].victoriesDomination += multiplier;
                        break;
                    case 4:
                        userRatingsConcat[i].victoriesReligious += multiplier;
                        break;
                    case 5:
                        userRatingsConcat[i].victoriesDiplomatic += multiplier;
                        break;
                    case 6:
                        userRatingsConcat[i].victoriesScore += multiplier;
                        break;
                }
            }
            userRatingsConcat[i].games += multiplier;
            userProfilesConcat[i].money += ratingNotesConcat[i].money*multiplier;
            userProfilesConcat[i].fame += ratingNotesConcat[i].fame*multiplier;
            if(multiplier > 0) {
                ratingObject.ratingNotes[i].isActive = true;    // Для revert
                usersTimingsConcat[i].game = currentDate;
            }
            else    // Дата уже есть
                ratingObject.ratingNotes[i].isActive = false;
        }
    }

    async sendToSpecifyChannel(interaction: CommandInteraction | ButtonInteraction, msg: MessageEmbed[]){
        let ratingChannel: TextChannel = await interaction.guild?.channels.fetch(this.ratingConfig.ratingChannelID) as TextChannel;
        await ratingChannel.send({embeds: msg});
    }

    async rating(interaction: CommandInteraction, gameType: "FFA" | "Teamers", victoryType: string, message: string, commandsAmount: number = 0){
        let ratingObject: RatingObject = new RatingObject(interaction, gameType, victoryType, message, commandsAmount);
        let ratingErrorNumber: number = ratingObject.init();
        if(ratingErrorNumber)
            return await interaction.reply({embeds: this.botlibEmbeds.error(`Некорректный список участников игры.\n${this.ratingConfig.errors[ratingErrorNumber-1]}.`), ephemeral: true});

        for(let id of ratingObject.usersID.concat(ratingObject.subUsersID)){
            let member: GuildMember|undefined = await interaction.guild?.members.fetch(id);
            if(!member)
                return await interaction.reply({embeds: this.botlibEmbeds.error(`Пользователь <@!${id}> вышел с сервера. Начисление рейтинга невозможно.`)});
            ratingObject.usernames.push(member.user.tag);
        }

        if(this.moderationService.getUserPermissionStatus(interaction, 3))
            return await this.applyRating(ratingObject, false);

        let channel: TextChannel = await interaction.guild?.channels.fetch(this.ratingConfig.ratingReportsChannelID) as TextChannel;
        ratingObject.message = await channel.send({
            embeds: [this.ratingEmbeds.ratingAwait(interaction.user, ratingObject)],
            components: this.ratingButtons.reportRows()
        });
        this.ratingReports.push(ratingObject);
        schedule.scheduleJob(Date.now() + this.botlibTimings.getTimeMs("d", 1), clearReports);
        await interaction.reply({embeds: this.botlibEmbeds.notify(`Ваш отчет был успешно отправлен в канал ${channel.toString()}. \nСначала участникам игры необходимо проверить его. Если все правильно, то через некоторое время администрация сервера подтвердит ваш отчет.`), ephemeral: true});
        await ratingObject.message.react(this.botlibEmojis.yes);
        await ratingObject.message.react(this.botlibEmojis.no);
    }

    async applyRating(ratingObject: RatingObject, auto: boolean){
        let gameID: number = await this.ratingNoteService.getNextID(ratingObject.interaction.guildId);
        let userRatingsConcat: IUserRating[] = [], userProfilesConcat: IUserProfile[] = [], usersTimingsConcat: IUserTimings[] = [];

        for(let id of ratingObject.usersID.concat(ratingObject.subUsersID)){
            userRatingsConcat.push(await this.userRatingService.getOne(ratingObject.interaction.guildId, id));
            userProfilesConcat.push(await this.userProfileService.getOne(ratingObject.interaction.guildId, id));
            usersTimingsConcat.push(await this.userTimingsService.getOne(ratingObject.interaction.guildId, id))
        }

        ratingObject.calculateNotes(gameID, userRatingsConcat);
        this.applyObjects(ratingObject, userRatingsConcat, userProfilesConcat, usersTimingsConcat);

        let ratingNotesConcat: IRatingNote[] = ratingObject.ratingNotes.concat(ratingObject.ratingNotesSub);
        await this.ratingNoteService.createFromArray(ratingNotesConcat);
        await this.userRatingService.updateFromArray(userRatingsConcat);
        await this.userProfileService.updateFromArray(userProfilesConcat);
        await this.userTimingsService.updateFromArray(usersTimingsConcat);

        let msg: MessageEmbed[] = [this.ratingEmbeds.ratingDefault(ratingObject.interaction.user, ratingObject, userRatingsConcat)];
        await this.sendToSpecifyChannel(ratingObject.interaction, msg);
        if(!auto)
            await ratingObject.interaction.reply({embeds: msg});

        for(let i in userRatingsConcat)
            await this.updateRole(await ratingObject.interaction.guild?.members.fetch(userRatingsConcat[i].userID) as GuildMember, userRatingsConcat[i].rating);
    }

    async ratingAdd(interaction: CommandInteraction, member: GuildMember, ratingType: string, ratingAmount: number){
        if(!this.moderationService.getUserPermissionStatus(interaction, 4))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        if(ratingAmount == 0)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Разница в рейтинге не должна быть равна 0.")});
        let userRating: IUserRating = await this.userRatingService.getOne(member.guild.id, member.id);
        let userRatingTotal: number;
        switch(ratingType){
            case "FFA":
                userRating.ratingFFA += ratingAmount;
                userRatingTotal = userRating.ratingFFA;
                break;
            case "Teamers":
                userRating.ratingTeamers += ratingAmount;
                userRatingTotal = userRating.ratingTeamers;
                break;
            default:
                userRating.rating += ratingAmount;
                userRatingTotal = userRating.rating;
                break;
        }
        await this.userRatingService.update(userRating);

        let msg: MessageEmbed[] = [this.ratingEmbeds.ratingSingle(member.user, interaction.user, ratingType, ratingAmount, userRatingTotal)];
        await interaction.reply({embeds: msg});
        await this.sendToSpecifyChannel(interaction, msg);

        if(ratingType == "Common")
            await this.updateRole(member, userRating.rating);
    }

    async ratingSet(interaction: CommandInteraction, member: GuildMember, ratingType: string, ratingAmount: number){
        if(!this.moderationService.getUserPermissionStatus(interaction, 4))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        let userRating: IUserRating = await this.userRatingService.getOne(member.guild.id, member.id);
        let userRatingTotal: number = ratingAmount;
        switch(ratingType){
            case "FFA":
                ratingAmount = userRatingTotal - userRating.ratingFFA;
                break;
            case "Teamers":
                ratingAmount = userRatingTotal - userRating.ratingTeamers;
                break;
            default:
                ratingAmount = userRatingTotal - userRating.rating;
                break;
        }
        if(ratingAmount == 0)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Разница в рейтинге не должна быть равна 0."), ephemeral: true});
        await this.userRatingService.update(userRating);

        let msg: MessageEmbed[] = [this.ratingEmbeds.ratingSingle(member.user, interaction.user, ratingType, ratingAmount, userRatingTotal)];
        await interaction.reply({embeds: msg});
        await this.sendToSpecifyChannel(interaction, msg);

        if(ratingType == "Common")
            await this.updateRole(member, userRating.rating);
    }

    async ratingCancel(interaction: CommandInteraction, gameNumber: number){
        if(!this.moderationService.getUserPermissionStatus(interaction, 3))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        let ratingNotes: IRatingNote[] = await this.ratingNoteService.getAllByID(gameNumber, interaction.guildId);
        if(ratingNotes.length == 0)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Игры с таким ID не существует."), ephemeral: true});
        if(!ratingNotes[0].isActive)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Игры уже была отменена.\nЕсли вы хотите переначислить эту игру, используйте команду \"/rating revert\"."), ephemeral: true});

        let userRatings: IUserRating[] = [], userProfiles: IUserProfile[] = [];
        for(let i in ratingNotes) {
            userRatings.push(await this.userRatingService.getOne(interaction.guildId, ratingNotes[i].userID));
            userProfiles.push(await this.userProfileService.getOne(interaction.guildId, ratingNotes[i].userID));
        }
        let ratingObject: RatingObject = new RatingObject(interaction, "", "", "", -1);
        ratingObject.loadNotes(ratingNotes);
        this.applyObjects(ratingObject, userRatings, userProfiles, [], false);

        await this.ratingNoteService.updateFromArray(ratingNotes);
        await this.userRatingService.updateFromArray(userRatings);
        await this.userProfileService.updateFromArray(userProfiles);

        for(let i in ratingNotes){
            let member: GuildMember|undefined = await interaction.guild?.members.fetch(ratingNotes[i].userID);
            ratingObject.usernames.push((member) ? member.user.tag : `<@${ratingNotes[i].userID}>`);
        }

        let msg: MessageEmbed[] = [this.ratingEmbeds.ratingCancel(interaction.user, ratingObject, userRatings)];
        await this.sendToSpecifyChannel(ratingObject.interaction, msg);
        await ratingObject.interaction.reply({embeds: msg});

        for(let i in userRatings)
            await this.updateRole(await ratingObject.interaction.guild?.members.fetch(userRatings[i].userID) as GuildMember, userRatings[i].rating);
    }

    async ratingRevert(interaction: CommandInteraction, gameNumber: number){
        if(!this.moderationService.getUserPermissionStatus(interaction, 3))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды."), ephemeral: true});
        let ratingNotes: IRatingNote[] = await this.ratingNoteService.getAllByID(gameNumber, interaction.guildId);
        if(ratingNotes.length == 0)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Игры с таким ID не существует."), ephemeral: true});
        if(ratingNotes[0].isActive)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Данная игра уже учитывается в списке отчетов.\nЕсли вы хотите отменить эту игру, используйте команду \"/rating cancel\"."), ephemeral: true});

        let userRatings: IUserRating[] = [], userProfiles: IUserProfile[] = [], userTimings: IUserTimings[] = [];
        for(let i in ratingNotes) {
            userRatings.push(await this.userRatingService.getOne(interaction.guildId, ratingNotes[i].userID));
            userProfiles.push(await this.userProfileService.getOne(interaction.guildId, ratingNotes[i].userID));
            userTimings.push(await this.userTimingsService.getOne(interaction.guildId, ratingNotes[i].userID));
        }
        let ratingObject: RatingObject = new RatingObject(interaction, "", "", "", -1);
        ratingObject.loadNotes(ratingNotes);
        this.applyObjects(ratingObject, userRatings, userProfiles, userTimings);

        await this.ratingNoteService.updateFromArray(ratingNotes);
        await this.userRatingService.updateFromArray(userRatings);
        await this.userProfileService.updateFromArray(userProfiles);
        await this.userTimingsService.updateFromArray(userTimings);

        for(let i in ratingNotes){
            let member: GuildMember|undefined = await interaction.guild?.members.fetch(ratingNotes[i].userID);
            ratingObject.usernames.push((member) ? member.user.tag : `<@${ratingNotes[i].userID}>`);
        }

        let msg: MessageEmbed[] = [this.ratingEmbeds.ratingRevert(interaction.user, ratingObject, userRatings)];
        await this.sendToSpecifyChannel(ratingObject.interaction, msg);
        await ratingObject.interaction.reply({embeds: msg});

        for(let i in userRatings)
            await this.updateRole(await ratingObject.interaction.guild?.members.fetch(userRatings[i].userID) as GuildMember, userRatings[i].rating);
    }
}
