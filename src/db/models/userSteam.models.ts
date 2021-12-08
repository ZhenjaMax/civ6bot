import {DataTypes, Model, Sequelize} from "sequelize";

const UserSteamModelObject = {
    id:     {type: DataTypes.STRING, unique: true, primaryKey: true},
    steamID:{type: DataTypes.STRING, defaultValue: null, allowNull: true},
};

export class UserSteam extends Model {
    public static initialize(sequelize: Sequelize) {
        this.init(UserSteamModelObject, {sequelize: sequelize});
    }
}
