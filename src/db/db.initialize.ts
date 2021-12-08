import {database} from "./db.config";
import {User} from "./models/user.models"
import {UserSteam} from "./models/userSteam.models";

User.initialize(database);
UserSteam.initialize(database);

database.sync({alter: true});
console.log("Database started");
