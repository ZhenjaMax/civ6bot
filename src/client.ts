import path from "path";
import { Intents, Interaction, Message } from "discord.js";
import { Client } from "discordx";
import * as dotenv from "dotenv";

dotenv.config();

const client = new Client({
  //simpleCommand: { prefix: process.env.BOT_PREFIX },
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
  classes: [
    path.join(__dirname, "bot/**/*.commands.{ts,js}"),
    path.join(__dirname, "bot/**/buttons/*.buttons.resolver.{ts,js}"),
    //path.join(__dirname, "commands", "*.{ts,js}")
  ],
  botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
  silent: true,
});

client.once("ready", async () => {
  await client.initApplicationCommands({
    guild:  { log: true },
    global: { log: true },
  });
  await client.initApplicationPermissions(true);  // init permissions; enabled log to see changes
  console.log("Bot started");
});

client.on("interactionCreate", (interaction: Interaction) => {
  client.executeInteraction(interaction);
});

client.on("messageCreate", (message: Message) => {
  client.executeCommand(message);
});

client.login(process.env.BOT_TOKEN as string);
