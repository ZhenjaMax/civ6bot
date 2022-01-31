import {DataTypes, Model} from "sequelize";
import {BaseService} from "../db.BaseService";

export const GuildConfigModel = {
    guildID:    { type: DataTypes.STRING, allowNull: false },

    leaderboardRatingChannel:           { type: DataTypes.STRING, defaultValue: null },
    leaderboardRatingFFAChannel:        { type: DataTypes.STRING, defaultValue: null },
    leaderboardRatingTeamersChannel:    { type: DataTypes.STRING, defaultValue: null },
    leaderboardFameChannel:     { type: DataTypes.STRING, defaultValue: null },
    leaderboardMoneyChannel:    { type: DataTypes.STRING, defaultValue: null },

    leaderboardRatingMessage:          { type: DataTypes.STRING, defaultValue: null },
    leaderboardRatingFFAMessage:       { type: DataTypes.STRING, defaultValue: null },
    leaderboardRatingTeamersMessage:   { type: DataTypes.STRING, defaultValue: null },
    leaderboardFameMessage:    { type: DataTypes.STRING, defaultValue: null },
    leaderboardMoneyMessage:   { type: DataTypes.STRING, defaultValue: null },

    leaderboardRatingAmount:           { type: DataTypes.NUMBER, defaultValue: 0 },
    leaderboardRatingFFAAmount:        { type: DataTypes.NUMBER, defaultValue: 0 },
    leaderboardRatingTeamersAmount:    { type: DataTypes.NUMBER, defaultValue: 0 },
    leaderboardFameAmount:     { type: DataTypes.NUMBER, defaultValue: 0 },
    leaderboardMoneyAmount:    { type: DataTypes.NUMBER, defaultValue: 0 },
};

export interface IGuildConfig {
    guildID: string;

    leaderboardRatingChannel: string | null;
    leaderboardRatingFFAChannel: string | null;
    leaderboardRatingTeamersChannel: string | null;
    leaderboardFameChannel: string | null;
    leaderboardMoneyChannel: string | null;

    leaderboardRatingMessage: string | null;
    leaderboardRatingFFAMessage: string | null;
    leaderboardRatingTeamersMessage: string | null;
    leaderboardFameMessage: string | null;
    leaderboardMoneyMessage: string | null;

    leaderboardRatingAmount: number;
    leaderboardRatingFFAAmount: number;
    leaderboardRatingTeamersAmount: number;
    leaderboardFameAmount: number;
    leaderboardMoneyAmount: number;
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
