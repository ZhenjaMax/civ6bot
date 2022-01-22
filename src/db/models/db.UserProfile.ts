import {DataTypes, Model} from "sequelize";
import {BaseService} from "../db.BaseService";

export const UserProfileModel = {
    guildID:  { type: DataTypes.STRING, allowNull: false },
    userID:   { type: DataTypes.STRING, allowNull: false },

    fame: 	  { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
    money:    { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
    likes:	  { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
    dislikes: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
    bonusStreak:{type: DataTypes.INTEGER, defaultValue: 0},

    description:      { type: DataTypes.STRING, defaultValue: "", allowNull: false },
    profileAvatarURL: { type: DataTypes.STRING, defaultValue: "", allowNull: false },
};

export interface IUserProfile{
    guildID: string;
    userID: string;

    fame: number;
    money: number;
    likes: number;
    dislikes: number;
    bonusStreak: number;

    description: string;
    profileAvatarURL: string;
}

export class UserProfile extends Model {}

export class UserProfileService extends BaseService {
    async create(guildID: string, userID: string): Promise<IUserProfile>{
        return this.normalize(await UserProfile.create({guildID: guildID, userID: userID})) as IUserProfile;
    }

    async update(userProfile: IUserProfile): Promise<IUserProfile>{
        let currentUserProfile: UserProfile|null = await UserProfile.findOne({where: {
            guildID: userProfile.guildID, userID: userProfile.userID
        }});
        if(!currentUserProfile)
            return this.create(userProfile.guildID, userProfile.userID);
        return this.normalize(currentUserProfile.update(userProfile));
    }

    async updateFromArray(usersProfile: IUserProfile[]): Promise<IUserProfile[]>{
        for(let i in usersProfile)
            await this.update(usersProfile[i]);
        return usersProfile;
    }

    async getOne(guildID: string, userID: string): Promise<IUserProfile>{
        let currentUserProfile: UserProfile|null = await UserProfile.findOne({where: {
            guildID: guildID, userID: userID
        }});
        if(!currentUserProfile)
            return this.create(guildID, userID);
        return this.normalize(currentUserProfile) as IUserProfile;
    }
}
