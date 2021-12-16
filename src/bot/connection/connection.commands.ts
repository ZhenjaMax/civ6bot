import {Discord, Slash, SlashOption} from "discordx";
import {ConnectionService} from "./connection.service";
import {CommandInteraction} from "discord.js";

@Discord()
export abstract class ConnectionCommands{
    connectionService: ConnectionService = ConnectionService.Instance;

    @Slash("link", { description: "Получить ссылку на лобби" })
    async link(
        @SlashOption("описание", { required: false }) description: string = "",
        interaction: CommandInteraction
    ){ await this.connectionService.getLobbyLink(interaction, description); }

    @Slash("connect", {description: "Подключить Steam к профилю"})
    async connect(interaction: CommandInteraction){ await this.connectionService.getConnect(interaction); }
}
