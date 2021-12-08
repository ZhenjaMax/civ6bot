import {CommandInteraction} from "discord.js";
import {BotlibEmbeds} from "../../botlib/botlib.embeds";
import {UserSteamService} from "../../db/services/userSteam.service";
import {ConnectionEmbeds} from "./connection.embeds";
import {ConnectionButtons} from "./buttons/connection.buttons";
const fetch = require('node-fetch');

// Singleton
export class ConnectionService{
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();
    connectionEmbeds: ConnectionEmbeds = new ConnectionEmbeds();
    userSteamService: UserSteamService = new UserSteamService();
    connectionButtons: ConnectionButtons = new ConnectionButtons();

    private static _instance: ConnectionService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    // закрытый профиль игнорируется, данные берутся
    // Нужно проверять игру 480 / 289070
    async getLobbyLink(interaction: CommandInteraction){
        let userData: any = await this.userSteamService.getOne(interaction.user.id);

        if(!userData)
            return await interaction.reply({embeds: [this.botlibEmbeds.error("Вашего аккаунта нет в базе данных.")]});
        if(!userData.steamID)
            return await interaction.reply({embeds: [this.botlibEmbeds.error("Вы не подключили Steam для бота.\nИспользуйте команду /link для подключения.")]});
        let steamAPIURL = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_KEY}&format=json&steamids=${userData.steamID}`;
        let steamData = await fetch(steamAPIURL);
        steamData = await steamData.json();
        steamData = steamData.response.players[0];

        if(!steamData.lobbysteamid)
            return await interaction.reply({embeds: [this.botlibEmbeds.error("Вы не создали игровое лобби или ваш профиль Steam \"не в сети\".")]});
        if(!(steamData.gameid == "480" || steamData.gameid == "289070"))
            return await interaction.reply({embeds: [this.botlibEmbeds.error("Вы играете в неподходящую игру для генерации ссылки.")]});
        let isLicense: boolean = (steamData.gameid == "289070");

        let steamLobbyURL: string = `steam://joinlobby/${steamData.gameid}/${steamData.lobbysteamid}/${steamData.steamid}`;
        await interaction.reply({
            embeds: [this.connectionEmbeds.link(steamLobbyURL, isLicense)],
            // Не работает
            // не поддерживает URI steam://
            // components: this.connectionButtons.linkButton(steamLobbyURL, isLicense)
        })
    }

    async getConnectLink(interaction: CommandInteraction){
        await interaction.reply({
            embeds: [this.connectionEmbeds.connect()],
            components: this.connectionButtons.connectButton(process.env.OAUTH2_REDIRECT_LINK as string)
        });
    }
}
