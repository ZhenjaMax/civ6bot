import {DataTypes, Model, Sequelize} from "sequelize";

const UserRatingObject = {
    serverID:   {type: DataTypes.STRING, primaryKey: true},
    id:         {type: DataTypes.STRING, primaryKey: true},

    ratingFFA:  {type: DataTypes.INTEGER, defaultValue: 1000, allowNull: false}
};

export class UserRating extends Model {
    public static initialize(sequelize: Sequelize) {
        this.init(UserRatingObject, {sequelize: sequelize});
    }
}
