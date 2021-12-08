import {DataTypes, Model, Sequelize} from "sequelize";

const UserModelObject = {
    serverID:   {type: DataTypes.STRING, primaryKey: true},
    id:         {type: DataTypes.STRING, primaryKey: true},

    description:        {type: DataTypes.TEXT},
    profileAvatarURL:   {type: DataTypes.STRING},
};

export class User extends Model {
    public static initialize(sequelize: Sequelize) {
        this.init(UserModelObject, {sequelize: sequelize});
    }
}
