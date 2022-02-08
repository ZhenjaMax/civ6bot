import {DataTypes, Model} from "sequelize";
import {BaseService} from "../db.BaseService";

export const GuildConfigModel = {
    guildID: { type: DataTypes.STRING, allowNull: false },

    draftFFACivilizationMin:  { type: DataTypes.NUMBER, defaultValue: 1 },
    draftFFACivilizationMax:  { type: DataTypes.NUMBER, defaultValue: 16 },
    draftBlindCivilizationMin: { type: DataTypes.NUMBER, defaultValue: 1 },
    draftBlindCivilizationMax:  { type: DataTypes.NUMBER, defaultValue: 16 },

    feedbackProposalChannelID: { type: DataTypes.STRING, defaultValue: null },
    feedbackProposalHoursMin: { type: DataTypes.NUMBER, defaultValue: 4 },

    moderationAdministratorRoleID: { type: DataTypes.STRING, defaultValue: null },
    moderationModeratorRoleID: { type: DataTypes.STRING, defaultValue: null },
    moderationSupportRoleID: { type: DataTypes.STRING, defaultValue: null },
    moderationRoleBanID: { type: DataTypes.STRING, defaultValue: null },
    moderationMuteVoiceRoleID: { type: DataTypes.STRING, defaultValue: null },
    moderationMuteChatRoleID: { type: DataTypes.STRING, defaultValue: null },
    moderationPunishmentChannelID: { type: DataTypes.STRING, defaultValue: null },  // Необязательный параметр
    moderationClearMax: { type: DataTypes.NUMBER, defaultValue: 10 },
    moderationBanTier1: { type: DataTypes.NUMBER, defaultValue: 1 },
    moderationBanTier2: { type: DataTypes.NUMBER, defaultValue: 2 },
    moderationBanTier3: { type: DataTypes.NUMBER, defaultValue: 3 },
    moderationBanTier4: { type: DataTypes.NUMBER, defaultValue: 5 },
    moderationBanTier5: { type: DataTypes.NUMBER, defaultValue: 7 },
    moderationBanTier6: { type: DataTypes.NUMBER, defaultValue: 14 },
    moderationBanTier7: { type: DataTypes.NUMBER, defaultValue: 28 },
    moderationBanTier8: { type: DataTypes.NUMBER, defaultValue: 365 },
    moderationWeakPointsMax: { type: DataTypes.NUMBER, defaultValue: 5 },

    ratingChannelID: { type: DataTypes.STRING, defaultValue: null },
    ratingReportsChannelID: { type: DataTypes.STRING, defaultValue: null },
    ratingD: { type: DataTypes.NUMBER, defaultValue: 400 },
    ratingK: { type: DataTypes.NUMBER, defaultValue: 30 },
    ratingMinRole0: { type: DataTypes.NUMBER, defaultValue: 0 },
    ratingMinRole1: { type: DataTypes.NUMBER, defaultValue: 850 },
    ratingMinRole2: { type: DataTypes.NUMBER, defaultValue: 900 },
    ratingMinRole3: { type: DataTypes.NUMBER, defaultValue: 1000 },
    ratingMinRole4: { type: DataTypes.NUMBER, defaultValue: 1100 },
    ratingMinRole5: { type: DataTypes.NUMBER, defaultValue: 1190 },
    ratingMinRole6: { type: DataTypes.NUMBER, defaultValue: 1270 },
    ratingMinRole7: { type: DataTypes.NUMBER, defaultValue: 1340 },
    ratingMinRole8: { type: DataTypes.NUMBER, defaultValue: 1400 },
    ratingRoleID0:  { type: DataTypes.STRING, defaultValue: null },
    ratingRoleID1:  { type: DataTypes.STRING, defaultValue: null },
    ratingRoleID2:  { type: DataTypes.STRING, defaultValue: null },
    ratingRoleID3:  { type: DataTypes.STRING, defaultValue: null },
    ratingRoleID4:  { type: DataTypes.STRING, defaultValue: null },
    ratingRoleID5:  { type: DataTypes.STRING, defaultValue: null },
    ratingRoleID6:  { type: DataTypes.STRING, defaultValue: null },
    ratingRoleID7:  { type: DataTypes.STRING, defaultValue: null },
    ratingRoleID8:  { type: DataTypes.STRING, defaultValue: null },
    ratingMultiplierMoney: { type: DataTypes.FLOAT, defaultValue: 1.5 },
    ratingMultiplierRating: { type: DataTypes.FLOAT, defaultValue: 1.3 },
    ratingBaseMoney: { type: DataTypes.NUMBER, defaultValue: 35 },

    leaderboardRatingChannelID:           { type: DataTypes.STRING, defaultValue: null },
    leaderboardRatingFFAChannelID:        { type: DataTypes.STRING, defaultValue: null },
    leaderboardRatingTeamersChannelID:    { type: DataTypes.STRING, defaultValue: null },
    leaderboardFameChannelID:     { type: DataTypes.STRING, defaultValue: null },
    leaderboardMoneyChannelID:    { type: DataTypes.STRING, defaultValue: null },
    leaderboardRatingMessageID:          { type: DataTypes.STRING, defaultValue: null },
    leaderboardRatingFFAMessageID:       { type: DataTypes.STRING, defaultValue: null },
    leaderboardRatingTeamersMessageID:   { type: DataTypes.STRING, defaultValue: null },
    leaderboardFameMessageID:    { type: DataTypes.STRING, defaultValue: null },
    leaderboardMoneyMessageID:   { type: DataTypes.STRING, defaultValue: null },
    leaderboardRatingAmount:           { type: DataTypes.NUMBER, defaultValue: 0 },
    leaderboardRatingFFAAmount:        { type: DataTypes.NUMBER, defaultValue: 0 },
    leaderboardRatingTeamersAmount:    { type: DataTypes.NUMBER, defaultValue: 0 },
    leaderboardFameAmount:     { type: DataTypes.NUMBER, defaultValue: 0 },
    leaderboardMoneyAmount:    { type: DataTypes.NUMBER, defaultValue: 0 },

    socialBaseMoney: { type: DataTypes.NUMBER, defaultValue: 25 },
    socialFameForDislike:  { type: DataTypes.NUMBER, defaultValue: 50 },
};

export interface IGuildConfig {
    guildID: string;

    draftFFACivilizationMin: number;
    draftFFACivilizationMax: number;
    draftBlindCivilizationMin: number;
    draftBlindCivilizationMax: number;

    feedbackProposalChannelID: string | null;
    feedbackProposalHoursMin: number;

    moderationAdministratorRoleID: string | null;
    moderationModeratorRoleID: string | null;
    moderationSupportRoleID: string | null;
    moderationRoleBanID: string | null;
    moderationMuteVoiceRoleID: string | null;
    moderationMuteChatRoleID: string | null;
    moderationPunishmentChannelID: string | null;
    moderationClearMax: number;
    moderationBanTier1: number;
    moderationBanTier2: number;
    moderationBanTier3: number;
    moderationBanTier4: number;
    moderationBanTier5: number;
    moderationBanTier6: number;
    moderationBanTier7: number;
    moderationBanTier8: number;
    moderationWeakPointsMax: number;

    ratingChannelID: string | null;
    ratingReportsChannelID: string | null;
    ratingD: number;
    ratingK: number;
    ratingMinRole0: number;         // Значение -1 показывает, что
    ratingMinRole1: number;         // значения не были настроены,
    ratingMinRole2: number;         // а ID ролей для таких рангов
    ratingMinRole3: number;         // не существует
    ratingMinRole4: number;         //
    ratingMinRole5: number;         //
    ratingMinRole6: number;         //
    ratingMinRole7: number;         //
    ratingMinRole8: number;         //
    ratingRoleID0: string | null;
    ratingRoleID1: string | null;
    ratingRoleID2: string | null;
    ratingRoleID3: string | null;
    ratingRoleID4: string | null;
    ratingRoleID5: string | null;
    ratingRoleID6: string | null;
    ratingRoleID7: string | null;
    ratingRoleID8: string | null;
    ratingMultiplierMoney: number;
    ratingMultiplierRating: number;
    ratingBaseMoney: number;

    leaderboardRatingChannelID: string | null;
    leaderboardRatingFFAChannelID: string | null;
    leaderboardRatingTeamersChannelID: string | null;
    leaderboardFameChannelID: string | null;
    leaderboardMoneyChannelID: string | null;
    leaderboardRatingMessageID: string | null;
    leaderboardRatingFFAMessageID: string | null;
    leaderboardRatingTeamersMessageID: string | null;
    leaderboardFameMessageID: string | null;
    leaderboardMoneyMessageID: string | null;
    leaderboardRatingAmount: number;
    leaderboardRatingFFAAmount: number;
    leaderboardRatingTeamersAmount: number;
    leaderboardFameAmount: number;
    leaderboardMoneyAmount: number;

    socialBaseMoney: number;
    socialFameForDislike: number;
}

export class GuildConfig extends Model {}

export class GuildConfigService extends BaseService{
    async create(guildID: string): Promise<IGuildConfig>{
        return this.normalize(await GuildConfig.create({guildID: guildID})) as IGuildConfig;
    }

    async update(guildConfig: IGuildConfig): Promise<IGuildConfig>{
        let currentGuildConfig: GuildConfig|null = await GuildConfig.findOne({where: {
            guildID: guildConfig.guildID
        }});
        if(!currentGuildConfig)
            return this.create(guildConfig.guildID);
        return this.normalize(currentGuildConfig.update(guildConfig));
    }

    async getOne(guildID: string): Promise<IGuildConfig>{
        let currentGuildConfig: GuildConfig|null = await GuildConfig.findOne({where: {
            guildID: guildID
        }});
        if(!currentGuildConfig)
            return this.create(guildID);
        return this.normalize(currentGuildConfig) as IGuildConfig;
    }
}
