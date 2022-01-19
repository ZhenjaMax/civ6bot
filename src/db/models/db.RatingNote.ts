import {DataTypes, Model} from "sequelize";
import {BaseService} from "../db.BaseService";

export const RatingNoteModel = {
    guildID:    { type: DataTypes.STRING,  allowNull: false },
    gameID: 	{ type: DataTypes.INTEGER, allowNull: false },

    gameType:	{ type: DataTypes.INTEGER, 	allowNull: false },					    // 0 = FFA, 1 = Teamers
    victoryType:{ type: DataTypes.INTEGER, 	defaultValue: 0,    allowNull: false }, // 0 = no, 1-6 = victories
    isActive:	{ type: DataTypes.BOOLEAN, 	defaultValue: true, allowNull: false },

    userID: 	{ type: DataTypes.STRING, 	allowNull: false },
    rating:		{ type: DataTypes.INTEGER, 	allowNull: false },
    ratingTyped:{ type: DataTypes.INTEGER, 	allowNull: false },
    money:		{ type: DataTypes.INTEGER, 	allowNull: false },
    fame:		{ type: DataTypes.INTEGER, 	allowNull: false }
};

export interface IRatingNote {
    guildID: string;
    gameID: number;

    gameType: number;
    victoryType: number;
    isActive: boolean;

    userID: string;
    rating: number;
    ratingTyped: number;
    money: number;
    fame: number;
}

export class RatingNote extends Model {}

export class RatingNoteService extends BaseService{
    async create(ratingNote: IRatingNote): Promise<IRatingNote>{
        return this.normalize(await RatingNote.create(ratingNote)) as IRatingNote;
    }

    async update(ratingNote: IRatingNote): Promise<IRatingNote>{
        let currentRatingNote: RatingNote|null = await RatingNote.findOne({where: {
            guildID: ratingNote.guildID, gameID: ratingNote.gameID, userID: ratingNote.userID
        }});
        if(!currentRatingNote)
            return this.create(ratingNote);
        return this.normalize(currentRatingNote.update(ratingNote));
    }

    async getAllByID(gameID: number, guildID: string): Promise<IRatingNote[]>{
        return this.normalize(await RatingNote.findAll({where: {
            gameID: gameID, guildID: guildID
        }})) as IRatingNote[];
    }

    async createFromArray(ratingNotes: IRatingNote[]): Promise<IRatingNote[]>{
        for(let x of ratingNotes)
            await this.create(x);
        return ratingNotes;
    }

    async updateFromArray(ratingNotes: IRatingNote[]): Promise<IRatingNote[]>{
        for(let x of ratingNotes)
            await this.update(x);
        return ratingNotes;
    }

    async getNextID(guildID: string): Promise<number>{
        let maxValue = await RatingNote.max("gameID", {where: {guildID: guildID}});
        return (maxValue) ? (maxValue as number)+1 : 1;
    }
}
