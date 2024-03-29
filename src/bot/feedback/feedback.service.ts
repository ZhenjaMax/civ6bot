import {CommandInteraction, GuildMember, Message, TextChannel, User} from "discord.js";
import {FeedbackEmbeds} from "./feedback.embeds";
import {FeedbackConfig} from "./feedback.config";
import {BotlibEmbeds, signEmbed} from "../../botlib/botlib.embeds";
import {ClientSingleton} from "../../client/client";
import {BotlibEmojis} from "../../botlib/botlib.emojis";
import {IUserTimings, UserTimingsService} from "../../db/models/db.UserTimings";
import {BotlibTimings} from "../../botlib/botlib.timings";

export class FeedbackService{
    userTimingsService: UserTimingsService = new UserTimingsService();
    feedbackEmbeds: FeedbackEmbeds = new FeedbackEmbeds();
    feedbackConfig: FeedbackConfig = new FeedbackConfig();
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();
    botlibEmojis: BotlibEmojis = new BotlibEmojis();
    botlibTimings: BotlibTimings = new BotlibTimings();

    private static _instance: FeedbackService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    async proposal(interaction: CommandInteraction, content: string){
        let member: GuildMember = interaction.member as GuildMember;
        let userTimings: IUserTimings = await this.userTimingsService.getOne(member.guild.id, member.id);
        if(userTimings.proposal)
            if(this.botlibTimings.getHoursDifference(userTimings.proposal) < this.feedbackConfig.proposalHoursMin)
                return await interaction.reply({embeds: this.botlibEmbeds.error(`Вы отправили предложение совсем недавно!\nКоманда будет доступна через ${this.botlibTimings.getTimeToNextTimeString(new Date(userTimings.proposal.getTime() + this.botlibTimings.getTimeMs("h", this.feedbackConfig.proposalHoursMin)))}.`), ephemeral: true});
        userTimings.proposal = new Date();
        await this.userTimingsService.update(userTimings);

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
