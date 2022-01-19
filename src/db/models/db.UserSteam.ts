import {DataTypes, Model} from "sequelize";
import {BaseService} from "../db.BaseService";

export const UserSteamModel = {
    id:         { type: DataTypes.STRING, unique: true, primaryKey: true },
    steamID:    { type: DataTypes.STRING, defaultValue: null, allowNull: true },
};

export interface IUserSteam {
    id: string;
    steamID: string;
}

export class UserSteam extends Model {}

export class UserSteamService extends BaseService{
    async create(id: string, steamID: string): Promise<IUserSteam>{
        return this.normalize(await UserSteam.create({id: id, steamID: steamID})) as IUserSteam
    }

    async update(userSteam: IUserSteam): Promise<IUserSteam|undefined>{
        let currentUserSteam = await UserSteam.findOne({where: {id: userSteam.id}});
        if(!currentUserSteam)
            return undefined;
        return this.normalize(await currentUserSteam.update(userSteam));
    }

    async getOne(id: string): Promise<IUserSteam|undefined>{
        return this.normalize(await UserSteam.findOne({where: {id: id}})) as (IUserSteam|undefined)
    }

    async hasSteamID(steamID: string): Promise<boolean>{
        return !!(await UserSteam.findOne({where: {steamID: steamID}}));
    }
}
