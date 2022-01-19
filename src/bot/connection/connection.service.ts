import {CommandInteraction} from "discord.js";
import {BotlibEmbeds, signEmbed} from "../../botlib/botlib.embeds";
import {IUserSteam, UserSteamService} from "../../db/models/db.UserSteam";
import {ConnectionEmbeds} from "./connection.embeds";
import {ConnectionButtons} from "./buttons/connection.buttons";
import {ConnectionConfig} from "./connection.config";
const fetch = require('node-fetch');

export class ConnectionService{
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();
    connectionEmbeds: ConnectionEmbeds = new ConnectionEmbeds();
    connectionConfig: ConnectionConfig = new ConnectionConfig();
    userSteamService: UserSteamService = new UserSteamService();
    connectionButtons: ConnectionButtons = new ConnectionButtons();

    private static _instance: ConnectionService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    // 1) закрытый профиль игнорируется, данные всё равно импортируется - нужно проверять игру 480 / 289070
    // 2) не поддерживает URI steam://, придётся использовать components: this.connectionButtons.linkButton(steamLobbyURL, isLicense)
    async getLobbyLink(interaction: CommandInteraction, description: string){
        let userData: IUserSteam | undefined = await this.userSteamService.getOne(interaction.user.id);

        if(!userData)
            return this.getConnect(interaction);
        let steamAPIURL = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_KEY}&format=json&steamids=${userData.steamID}`;
        let steamData = await fetch(steamAPIURL);
        steamData = await steamData.json();
        steamData = steamData.response.players[0];

        if(!steamData.lobbysteamid)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Вы не создали игровое лобби или ваш профиль Steam \"не в сети\".")});
        if(!(steamData.gameid == this.connectionConfig.headerPirate || steamData.gameid == this.connectionConfig.headerLicense))
            return await interaction.reply({embeds: this.botlibEmbeds.error("Вы играете в неподходящую игру для генерации ссылки.")});
        let isLicense: boolean = (steamData.gameid == this.connectionConfig.headerLicense);

        let steamLobbyURL: string = `steam://joinlobby/${steamData.gameid}/${steamData.lobbysteamid}/${steamData.steamid}`;
        await interaction.reply({embeds: signEmbed(interaction, this.connectionEmbeds.link(steamLobbyURL, isLicense, description)),});
    }

    async getConnect(interaction: CommandInteraction){
        await interaction.reply({
            embeds: [this.connectionEmbeds.connect()],
            components: this.connectionButtons.connectButton(process.env.OAUTH2_REDIRECT_LINK as string),
            ephemeral: true
        });
    }
}
