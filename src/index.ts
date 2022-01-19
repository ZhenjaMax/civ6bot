import * as dotenv from "dotenv";
import {ClientSingleton} from "./client/client";
import {importx} from "@discordx/importer";
dotenv.config();

const client = ClientSingleton.Instance;
importx(__dirname + "/bot/*/*.commands.{js,ts}",
    __dirname + "/bot/*/buttons/*.buttons.resolver.{js,ts}",
    __dirname + "/db/db.initialize.{js,ts}",
    __dirname + "/oauth2/oauth2.{js,ts}"
);
client.login();
