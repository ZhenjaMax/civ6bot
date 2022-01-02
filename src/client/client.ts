import {Client} from "discordx";
import {Intents, Interaction} from "discord.js";

export class ClientSingleton{
    client = new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            Intents.FLAGS.GUILD_VOICE_STATES,
        ],
        botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
        silent: true,
        shards: "auto",
        restTimeOffset: 0
    });

    private static _instance: ClientSingleton;
    private constructor(){}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    public async login(){
        this.client.once("ready", async () => {
            await this.client.initApplicationCommands({global: { log: true }});
            await this.client.initApplicationPermissions(true);  // init permissions; enabled log to see changes
            console.log("Civilization VI bot started");
        });
        this.client.on("interactionCreate", (interaction: Interaction) => {this.client.executeInteraction(interaction);});
        this.client.login(process.env.BOT_TOKEN as string);
    }
}
