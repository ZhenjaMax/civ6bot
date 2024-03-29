import {Client} from "discordx";
import {Intents, Interaction} from "discord.js";
import {AdapterClientModeration} from "../bot/adapters/adapter.client.moderation";
import {dbInitialize} from "../db/db.initialize";

export class ClientSingleton{
    adapterClientModeration: AdapterClientModeration = new AdapterClientModeration();

    client = new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_VOICE_STATES,
            Intents.FLAGS.GUILD_PRESENCES,
            Intents.FLAGS.DIRECT_MESSAGES,
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
            await dbInitialize();
            await this.adapterClientModeration.checkOnReady();
            console.log("Civilization VI bot started");
        });
        this.client.on("interactionCreate", (interaction: Interaction) => {this.client.executeInteraction(interaction);});
        this.client.on("guildMemberAdd", (member) => {this.adapterClientModeration.checkMember(member)});
        this.client.login(process.env.BOT_TOKEN as string);
    }
}
