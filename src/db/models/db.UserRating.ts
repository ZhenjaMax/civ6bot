import {DataTypes, Model, Op} from "sequelize";
import {BaseService} from "../db.BaseService";

export const UserRatingModel = {
    guildID:    { type: DataTypes.STRING, allowNull: false },
    userID:     { type: DataTypes.STRING, allowNull: false },

    rating: 		{ type: DataTypes.INTEGER, 	defaultValue: 1000, allowNull: false },
    ratingFFA: 		{ type: DataTypes.INTEGER, 	defaultValue: 1000, allowNull: false },
    ratingTeamers:  { type: DataTypes.INTEGER, 	defaultValue: 1000, allowNull: false },

    games:              { type: DataTypes.INTEGER, 	defaultValue: 0, allowNull: false },
    victoriesFFA:       { type: DataTypes.INTEGER, 	defaultValue: 0, allowNull: false },
    defeatsFFA: 	    { type: DataTypes.INTEGER, 	defaultValue: 0, allowNull: false },
    firstPlaceFFA: 	    { type: DataTypes.INTEGER, 	defaultValue: 0, allowNull: false },
    victoriesTeamers:   { type: DataTypes.INTEGER, 	defaultValue: 0, allowNull: false },
    defeatsTeamers:     { type: DataTypes.INTEGER, 	defaultValue: 0, allowNull: false },

    victoriesScience:	{ type: DataTypes.INTEGER, 	defaultValue: 0, allowNull: false },
    victoriesCulture:	{ type: DataTypes.INTEGER, 	defaultValue: 0, allowNull: false },
    victoriesDomination:{ type: DataTypes.INTEGER, 	defaultValue: 0, allowNull: false },
    victoriesReligious:	{ type: DataTypes.INTEGER, 	defaultValue: 0, allowNull: false },
    victoriesDiplomatic:{ type: DataTypes.INTEGER, 	defaultValue: 0, allowNull: false },
    victoriesScore:		{ type: DataTypes.INTEGER, 	defaultValue: 0, allowNull: false },
};

export interface IUserRating {
    guildID: string;
    userID: string;

    rating: number;
    ratingFFA: number;
    ratingTeamers: number;

    games: number;
    victoriesFFA: number;
    defeatsFFA: number;
    firstPlaceFFA: number;
    victoriesTeamers: number;
    defeatsTeamers: number;

    victoriesScience: number;
    victoriesCulture: number;
    victoriesDomination: number;
    victoriesReligious:	number;
    victoriesDiplomatic: number;
    victoriesScore: number;
}

export class UserRating extends Model {}

export class UserRatingService extends BaseService{
    async create(guildID: string, userID: string): Promise<IUserRating>{
        return this.normalize(await UserRating.create({userID: userID, guildID: guildID})) as IUserRating;
    }

    // Если не существует, создаёт экземпляр
    async update(userRating: IUserRating): Promise<IUserRating>{
        let currentUserRating: UserRating|null = await UserRating.findOne({where: {guildID: userRating.guildID, userID: userRating.userID}});
        if(!currentUserRating)
            return await this.createFull(userRating);
        return this.normalize(await currentUserRating.update(userRating)) as IUserRating;
    }

    async updateFromArray(usersRating: IUserRating[]): Promise<IUserRating[]>{
        for(let i in usersRating)
            await this.update(usersRating[i]);
        return usersRating;
    }

    // Если не существует, создаёт экземпляр
    async getOne(guildID: string, userID: string): Promise<IUserRating>{
        let currentUserRating: UserRating|null = await UserRating.findOne({where: {guildID: guildID, userID: userID}});
        if(!currentUserRating)
            return await this.create(guildID, userID);
        return this.normalize(currentUserRating) as IUserRating;
    }

    async createFull(userRating: IUserRating): Promise<IUserRating>{
        return this.normalize(await UserRating.create(userRating)) as IUserRating;
    }

    async getAllPlayed(guildID: string): Promise<IUserRating[]>{
        return this.normalize(await UserRating.findAll({where: {
            guildID: guildID,
            games: {[Op.not]: 0}
        }})) as IUserRating[];
    }

    async getBestPlayers(guildID: string, ratingType: string, limitAmount: number): Promise<IUserRating[]>{
        return this.normalize(await UserRating.findAll({
            where: {
                guildID: guildID,
                games: {[Op.not]: 0}
            },
            order: [[ratingType, "DESC"]],
            limit: limitAmount
        }));
    }
}
