import {ButtonInteraction, CommandInteraction, Message, TextChannel} from "discord.js";
import {GuildConfigService, IGuildConfig} from "../../db/models/db.GuildConfig";
import {LeaderboardEmbeds} from "./leaderboard.embeds";
import {LeaderboardConfig} from "./leaderboard.config";
import {BotlibEmbeds} from "../../botlib/botlib.embeds";
import {IUserRating, UserRatingService} from "../../db/models/db.UserRating";
import {IUserProfile, UserProfileService} from "../../db/models/db.UserProfile";
import {PermissionsService} from "../permissions/permissions.service";

export class LeaderboardService{
    leaderboardConfig: LeaderboardConfig = new LeaderboardConfig();
    leaderboardEmbeds: LeaderboardEmbeds = new LeaderboardEmbeds();
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();
    guildConfigService: GuildConfigService = new GuildConfigService();
    userRatingService: UserRatingService = new UserRatingService();
    userProfileService: UserProfileService = new UserProfileService();
    permissionsService: PermissionsService = PermissionsService.Instance;

    private static _instance: LeaderboardService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    private async leaderboardRoutine(interaction: CommandInteraction | ButtonInteraction, type: string, isCreate: boolean, amount: number = 0){
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(interaction.guildId);
        let previousChannelID: string|null = null, previousMessageID: string|null = null;
        let msg: Message|undefined = undefined, channel: TextChannel|undefined = undefined;
        if(isCreate) {
            channel = interaction.channel as TextChannel;
            msg = await channel.send({embeds: this.botlibEmbeds.notify("Создается таблица лидеров. Пожалуйста, подождите...")});
        }

        switch(type){
            case "rating":
                previousChannelID = guildConfig.leaderboardRatingChannelID;
                previousMessageID = guildConfig.leaderboardRatingMessageID;
                guildConfig.leaderboardRatingChannelID = channel?.id || null;
                guildConfig.leaderboardRatingMessageID = msg?.id || null;
                guildConfig.leaderboardRatingAmount = amount;
                break;
            case "ratingFFA":
                previousChannelID = guildConfig.leaderboardRatingFFAChannelID;
                previousMessageID = guildConfig.leaderboardRatingFFAMessageID;
                guildConfig.leaderboardRatingFFAChannelID = channel?.id || null;
                guildConfig.leaderboardRatingFFAMessageID = msg?.id || null;
                guildConfig.leaderboardRatingFFAAmount = amount;
                break;
            case "ratingTeamers":
                previousChannelID = guildConfig.leaderboardRatingTeamersChannelID;
                previousMessageID = guildConfig.leaderboardRatingTeamersMessageID;
                guildConfig.leaderboardRatingTeamersChannelID = channel?.id || null;
                guildConfig.leaderboardRatingTeamersMessageID = msg?.id || null;
                guildConfig.leaderboardRatingTeamersAmount = amount;
                break;
            case "money":
                previousChannelID = guildConfig.leaderboardMoneyChannelID;
                previousMessageID = guildConfig.leaderboardMoneyMessageID;
                guildConfig.leaderboardMoneyChannelID = channel?.id || null;
                guildConfig.leaderboardMoneyMessageID = msg?.id || null;
                guildConfig.leaderboardMoneyAmount = amount;
                break;
            case "fame":
                previousChannelID = guildConfig.leaderboardFameChannelID;
                previousMessageID = guildConfig.leaderboardFameMessageID;
                guildConfig.leaderboardFameChannelID = channel?.id || null;
                guildConfig.leaderboardFameMessageID = msg?.id || null;
                guildConfig.leaderboardFameAmount = amount;
                break;
        }
        await this.guildConfigService.update(guildConfig);

        try{
            if(previousChannelID && previousMessageID){
                let previousChannel: TextChannel = await interaction.guild?.channels.fetch(previousChannelID) as TextChannel;
                let previousMessage: Message = await previousChannel.messages.fetch(previousMessageID);
                await previousMessage.delete();
            }
        } catch {}
    }

    async create(interaction: CommandInteraction, type: string, amount: number){
        await interaction.deferReply({ephemeral: true});
        if(!await this.permissionsService.getUserPermissionStatus(interaction, 5))
            return await interaction.editReply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды.")});
        if((amount > this.leaderboardConfig.maxLeaderboardUsers) || (amount < this.leaderboardConfig.minLeaderboardUsers))
            return await interaction.editReply({embeds: this.botlibEmbeds.error(`От ${this.leaderboardConfig.minLeaderboardUsers} до ${this.leaderboardConfig.maxLeaderboardUsers} игроков для таблицы.`)});

        await this.leaderboardRoutine(interaction, type, true, amount);
        await this.update(interaction, type);
        await interaction.editReply({embeds: this.botlibEmbeds.notify("Таблица лидеров была опубликована.")});
    }

    async delete(interaction: CommandInteraction, type: string){
        await interaction.deferReply({ephemeral: true});
        if(!await this.permissionsService.getUserPermissionStatus(interaction, 5))
            return await interaction.editReply({embeds: this.botlibEmbeds.error("У вас нет прав для выполнения этой команды.")});

        await this.leaderboardRoutine(interaction, type, false);
        await interaction.editReply({embeds: this.botlibEmbeds.notify("Таблица лидеров была удалена.")});
    }

    async update(interaction: CommandInteraction | ButtonInteraction, type: string){
        let guildConfig: IGuildConfig = await this.guildConfigService.getOne(interaction.guildId);
        let channelID: string|null = null;
        let messageID: string|null = null;
        switch (type) {
            case "rating":
                channelID = guildConfig.leaderboardRatingChannelID;
                messageID = guildConfig.leaderboardRatingMessageID;
                break;
            case "ratingFFA":
                channelID = guildConfig.leaderboardRatingFFAChannelID;
                messageID = guildConfig.leaderboardRatingFFAMessageID;
                break;
            case "ratingTeamers":
                channelID = guildConfig.leaderboardRatingTeamersChannelID;
                messageID = guildConfig.leaderboardRatingTeamersMessageID;
                break;
            case "money":
                channelID = guildConfig.leaderboardMoneyChannelID;
                messageID = guildConfig.leaderboardMoneyMessageID;
                break;
            case "fame":
                channelID = guildConfig.leaderboardFameChannelID;
                messageID = guildConfig.leaderboardFameMessageID;
                break;
        }
        if(!channelID || !messageID)
            return;

        let usersID: string[] = [];
        let values: number[] = [];
        let amount: number = 0;
        switch(type){
            case "rating":
                amount = guildConfig.leaderboardRatingAmount;
            case "ratingFFA":
                if(amount == 0)
                    amount = guildConfig.leaderboardRatingFFAAmount;
            case "ratingTeamers":
                if(amount == 0)
                    amount = guildConfig.leaderboardRatingTeamersAmount;
                let userRatings: IUserRating[] = await this.userRatingService.getBestPlayers(interaction.guildId, type, amount);
                userRatings.forEach(x => {
                    usersID.push(x.userID);
                    values.push(
                        (type == "rating")
                        ? x.rating
                        : (type == "ratingFFA")
                            ? x.ratingFFA
                            : x.ratingTeamers
                    );
                })
                break;
            case "money":
                amount = guildConfig.leaderboardMoneyAmount;
            case "fame":
                if(amount == 0)
                    amount = guildConfig.leaderboardFameAmount;
                let userProfiles: IUserProfile[] = await this.userProfileService.getBestPlayers(interaction.guildId, type, amount);
                userProfiles.forEach(x => {
                    usersID.push(x.userID);
                    values.push((type == "money") ? x.money : x.fame);
                })
                break;
        }
        try{
            let channel: TextChannel = await interaction.guild?.channels.fetch(channelID) as TextChannel;
            let message: Message = await channel.messages.fetch(messageID);
            await message.edit({embeds: this.leaderboardEmbeds.leaderboard(usersID, values, type)});
        } catch {
            await this.leaderboardRoutine(interaction, type, false);
        }
    }
}
