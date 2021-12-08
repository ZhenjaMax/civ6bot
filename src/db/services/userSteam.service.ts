import {UserSteam} from "../models/userSteam.models";
import {BaseService} from "./base.service";

export class UserSteamService extends BaseService{
    async create(id: string, steamID: string): Promise<any>{
        return this.normalize(await UserSteam.create({
            id: id,
            steamID: steamID
        }))
    }

    async update(id: string, steamID: string): Promise<any>{
        let userSteam = await UserSteam.findOne({where: {
                id: id
            }});
        if(!userSteam)
            return undefined;
        return this.normalize(await userSteam.update({
            steamID: steamID
        }));
    }

    /*
    async getAll(): Promise<any[]> {
        return this.normalize(await UserSteam.findAll());
    }
    */

    async hasSteamID(steamID: string): Promise<boolean>{
        let userSteam = await UserSteam.findOne({where: {
                steamID: steamID
            }});
        return !!userSteam;
    }

    async getOne(id: string): Promise<any>{
        return this.normalize(await UserSteam.findOne({where: {
                id: id
            }}));
    }
}
