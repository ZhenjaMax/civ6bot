import {DataTypes, Model, Op} from "sequelize";
import {BaseService} from "../db.BaseService";

export const UserPunishmentModel = {
    guildID:    { type: DataTypes.STRING, allowNull: false },
    userID:     { type: DataTypes.STRING, allowNull: false },

    banned: 	{ type: DataTypes.DATE, defaultValue: null },
    mutedVoice: { type: DataTypes.DATE,	defaultValue: null },
    mutedChat: 	{ type: DataTypes.DATE,	defaultValue: null },

    banTier:    { type: DataTypes.INTEGER, 	defaultValue: 0, allowNull: false },
    weakPoints: { type: DataTypes.INTEGER, 	defaultValue: 0, allowNull: false },
};

export interface IUserPunishment{
    guildID: string;
    userID: string;

    banned: Date | null;
    mutedVoice: Date | null;
    mutedChat: 	Date | null;

    banTier: number;
    weakPoints: number;
}

export class UserPunishment extends Model {}

export class UserPunishmentService extends BaseService {
    async create(guildID: string, userID: string): Promise<IUserPunishment>{
        return this.normalize(await UserPunishment.create({userID: userID, guildID: guildID})) as IUserPunishment;
    }

    // Если не существует, создаёт экземпляр
    async update(userPunishment: IUserPunishment): Promise<IUserPunishment>{
        let currentUserPunishment: UserPunishment|null = await UserPunishment.findOne({where: {guildID: userPunishment.guildID, userID: userPunishment.userID}});
        if(!currentUserPunishment)
            return await this.createFull(userPunishment);
        return this.normalize(await currentUserPunishment.update(userPunishment)) as IUserPunishment;
    }

    // Если не существует, создаёт экземпляр
    async getOne(guildID: string, userID: string): Promise<IUserPunishment>{
        let currentUserPunishment: UserPunishment|null = await UserPunishment.findOne({where: {guildID: guildID, userID: userID}});
        if(!currentUserPunishment)
            return await this.create(guildID, userID);
        return this.normalize(currentUserPunishment) as IUserPunishment;
    }

    private async createFull(userPunishment: IUserPunishment): Promise<IUserPunishment>{
        return this.normalize(await UserPunishment.create(userPunishment)) as IUserPunishment;
    }

    async getAllPunished(): Promise<IUserPunishment[]>{
        return this.normalize(await UserPunishment.findAll({where: {
            [Op.or]: [
                {banned: {[Op.not]: null}},
                {mutedVoice: {[Op.not]: null}},
                {mutedChat: {[Op.not]: null}},
            ]
        }})) as IUserPunishment[];
    }
}
