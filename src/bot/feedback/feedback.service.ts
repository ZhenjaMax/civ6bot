import {CommandInteraction, GuildMember, Message, TextChannel, User} from "discord.js";
import {FeedbackEmbeds} from "./feedback.embeds";
import {FeedbackConfig} from "./feedback.config";
import {BotlibEmbeds, signEmbed} from "../../botlib/botlib.embeds";
import {ClientSingleton} from "../../client/client";
import {BotlibEmojis} from "../../botlib/botlib.emojis";

export class FeedbackService{
    feedbackEmbeds: FeedbackEmbeds = new FeedbackEmbeds();
    feedbackConfig: FeedbackConfig = new FeedbackConfig();
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();
    botlibEmojis: BotlibEmojis = new BotlibEmojis();

    private static _instance: FeedbackService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    async proposal(interaction: CommandInteraction, content: string){
        let channel: TextChannel = await interaction.guild?.channels.fetch(this.feedbackConfig.proposalChannelID) as TextChannel;
        let msg: Message = await channel.send({embeds: signEmbed(interaction, this.feedbackEmbeds.proposal(interaction.user, content))});
        await interaction.reply({embeds: this.botlibEmbeds.notify(`✍ Ваше предложение было опубликовано в канал ${channel.toString()}.`), ephemeral: true});
        await msg.react(this.botlibEmojis.yes);
        await msg.react(this.botlibEmojis.no);
    }

    async help(interaction: CommandInteraction){ await interaction.reply({embeds: [this.feedbackEmbeds.help()]}) }

    async about(interaction: CommandInteraction){ await interaction.reply({embeds: [this.feedbackEmbeds.about()]}) }

    // Шаблон для следующих команд
    async feedback(interaction: CommandInteraction, content: string){
        let owner: User = await ClientSingleton.Instance.client.users.fetch(this.feedbackConfig.ownerID);
        await owner.send({embeds: signEmbed(interaction, this.feedbackEmbeds.feedback(interaction.member as GuildMember, content))});
        await interaction.reply({embeds: this.botlibEmbeds.notify(`✍ Ваше сообщение было отправлено владельцу бота.`), ephemeral: true});
    }
}
