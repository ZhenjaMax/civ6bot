import {DataTypes, Model} from "sequelize";
import {BaseService} from "../db.BaseService";

export const UserTimingsModel = {
    guildID:  { type: DataTypes.STRING, allowNull: false },
    userID:   { type: DataTypes.STRING, allowNull: false },

    like:       { type: DataTypes.DATE, defaultValue: null },
    dislike:    { type: DataTypes.DATE, defaultValue: null },
    bonus:      { type: DataTypes.DATE, defaultValue: null },

    game:       { type: DataTypes.DATE, defaultValue: null },
};

export interface IUserTimings{
    guildID: string;
    userID: string;

    like: Date | null;
    dislike: Date | null;
    bonus: Date | null;

    game: Date | null;
}

export class UserTimings extends Model {}

export class UserTimingsService extends BaseService {
    async create(guildID: string, userID: string): Promise<IUserTimings>{
        return this.normalize(await UserTimings.create({guildID: guildID, userID: userID})) as IUserTimings;
    }

    async update(userTimings: IUserTimings): Promise<IUserTimings>{
        let currentUserTimings: UserTimings|null = await UserTimings.findOne({where: {
            guildID: userTimings.guildID, userID: userTimings.userID
        }});
        if(!currentUserTimings) {
            await this.create(userTimings.guildID, userTimings.userID);
            currentUserTimings = await UserTimings.findOne({where: {
                guildID: userTimings.guildID, userID: userTimings.userID
            }});
        }
        return this.normalize(currentUserTimings?.update(userTimings));
    }

    async updateFromArray(usersTimings: IUserTimings[]): Promise<IUserTimings[]>{
        for(let i in usersTimings)
            await this.update(usersTimings[i]);
        return usersTimings;
    }

    async getOne(guildID: string, userID: string): Promise<IUserTimings>{
        let currentUserTimings: UserTimings|null = await UserTimings.findOne({where: {
            guildID: guildID, userID: userID
        }});
        if(!currentUserTimings)
            return this.create(guildID, userID);
        return this.normalize(currentUserTimings) as IUserTimings;
    }
}
