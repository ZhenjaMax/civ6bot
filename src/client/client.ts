import {Client} from "discordx";
import {Intents, Interaction} from "discord.js";
import {AdapterClientModeration} from "../bot/adapters/adapter.client.moderation";

export class ClientSingleton{
    adapterClientModeration: AdapterClientModeration = new AdapterClientModeration();

    client = new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_VOICE_STATES,
            Intents.FLAGS.GUILD_PRESENCES,
            Intents.FLAGS.DIRECT_MESSAGES,
            Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
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
            await this.adapterClientModeration.checkOnReady();
            try{
                await this.adapterClientModeration.checkOnReady();
            } catch (readyError) {
                console.log("Check members error, pass")
            } finally {
                console.log("Civilization VI bot started");
            }
        });
        this.client.on("interactionCreate", (interaction: Interaction) => {this.client.executeInteraction(interaction);});
        this.client.on("guildMemberAdd", (member) => {this.adapterClientModeration.checkMember(member)});
        this.client.login(process.env.BOT_TOKEN as string);
    }
}
