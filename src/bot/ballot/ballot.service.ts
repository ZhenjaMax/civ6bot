import {CommandInteraction, GuildMember, Message, User} from "discord.js";
import {BallotEmbeds} from "./ballot.embeds";
import {IUserTimings, UserTimingsService} from "../../db/models/db.UserTimings";
import {IUserRating, UserRatingService} from "../../db/models/db.UserRating";
import {BallotObject} from "./ballot.models";
import {BotlibEmbeds} from "../../botlib/botlib.embeds";
import {BotlibEmojis} from "../../botlib/botlib.emojis";
import {BotlibTimings} from "../../botlib/botlib.timings";
import {BallotConfig} from "./ballot.config";
import {PermissionsService} from "../permissions/permissions.service";

export class BallotService{
    ballotEmbeds: BallotEmbeds = new BallotEmbeds();
    ballotConfig: BallotConfig = new BallotConfig();
    permissionsService: PermissionsService = PermissionsService.Instance;
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();
    botlibEmojis: BotlibEmojis = new BotlibEmojis();
    botlibTimings: BotlibTimings = new BotlibTimings();
    userTimingsService: UserTimingsService = new UserTimingsService();
    userRatingService: UserRatingService = new UserRatingService();

    private static _instance: BallotService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    // Скопировано из канала,
    // стоит обратить внимание на внутренний цикл for
    protected async getUsersFromReactions(message: Message): Promise<Map<string, User[]>>{
        message = await message.fetch(true);
        const reactionCollection = message.reactions.cache;
        const returnMap: Map<string, User[]> = new Map();
        for(let [reaction, messageReaction] of reactionCollection){
            const reactionUserManager = messageReaction.users;
            const userReactionCollection = await reactionUserManager.fetch();
            for(const [, user] of userReactionCollection)
                if(returnMap.has(reaction))
                    returnMap.get(reaction)?.push(user);
                else
                    returnMap.set(reaction, [user]);
        }
        return returnMap;
    }

    async create(interaction: CommandInteraction, member: GuildMember, isDefault: boolean, content: string) {
        await interaction.deferReply({ephemeral: true});
        if(!this.permissionsService.getUserPermissionStatus(interaction, 4))
            return await interaction.editReply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды.")});
        let userRating: IUserRating = await this.userRatingService.getOne(member.guild.id, member.id);
        let userTimings: IUserTimings = await this.userTimingsService.getOne(member.guild.id, member.id);
        let ballot: BallotObject = new BallotObject(member.user, isDefault, content, userRating, userTimings);
        let msg: Message|undefined = await interaction.channel?.send({embeds: [this.ballotEmbeds.ballot(ballot)]});
        await interaction.editReply({embeds: this.botlibEmbeds.notify("Бюллетень был успешно опубликован.")});
        await msg?.react(this.botlibEmojis.yes);
        await msg?.react(this.botlibEmojis.no);
    }

    async resolve(interaction: CommandInteraction) {
        await interaction.deferReply({ephemeral: true});
        if(!this.permissionsService.getUserPermissionStatus(interaction, 4))
            return await interaction.editReply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды.")});
        if(!interaction.channel)
            return await interaction.editReply({embeds: this.botlibEmbeds.error("Произошла ошибка во время поиска бюллетеней.")});

        let fetchedMsg: Message[] = Array.from((await interaction.channel?.messages.fetch({limit: this.ballotConfig.ballotsMax})).values());
        for(let msg of fetchedMsg) {
            let reactionMap = await this.getUsersFromReactions(msg);
            let usersYes: User[] = reactionMap.get(this.botlibEmojis.yesID) || [];
            let usersNo: User[] = reactionMap.get(this.botlibEmojis.noID) || [];
            for(let i in usersYes){
                let tempIndex: number = usersNo.indexOf(usersYes[i]);
                if(tempIndex != -1){
                    await msg.reactions.resolve(this.botlibEmojis.yesID)?.users.remove(usersYes[i]);
                    await msg.reactions.resolve(this.botlibEmojis.noID)?.users.remove(usersNo[tempIndex]);
                    usersNo.splice(tempIndex, 1);
                } else {
                    let userTimings: IUserTimings = await this.userTimingsService.getOne(msg.guildId as string, usersYes[i].id);
                    let days: number = this.botlibTimings.getDaysDifference(userTimings.game);
                    if((days == -1) || (days > this.ballotConfig.lastGameWarningMajor) || usersYes[i].bot)
                        await msg.reactions.resolve(this.botlibEmojis.yesID)?.users.remove(usersYes[i]);
                }
            }
            for(let i in usersNo){
                let userTimings: IUserTimings = await this.userTimingsService.getOne(msg.guildId as string, usersYes[i].id);
                let days: number = this.botlibTimings.getDaysDifference(userTimings.game);
                if((days == -1) || (days > this.ballotConfig.lastGameWarningMajor) || usersYes[i].bot)
                    await msg.reactions.resolve(this.botlibEmojis.noID)?.users.remove(usersYes[i]);
            }
        }
        await interaction.editReply({embeds: this.botlibEmbeds.notify(`Бюллетени (${fetchedMsg.length}) были успешно обработаны.`)});
    }
}
