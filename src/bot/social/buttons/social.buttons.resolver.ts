import {ButtonComponent, Discord} from "discordx";
import {SocialService} from "../social.service";
import {ButtonInteraction, GuildMember, Message} from "discord.js";
import {IProfileMessagePair} from "../social.models";
import {signEmbed} from "../../../botlib/botlib.embeds";
import {IUserRating} from "../../../db/models/db.UserRating";
import {IUserTimings} from "../../../db/models/db.UserTimings";

@Discord()
export abstract class SocialButtonsResolver{
    socialService: SocialService = SocialService.Instance;

    @ButtonComponent("bonus")
    async bonus(interaction: ButtonInteraction){ await this.socialService.bonus(interaction) }

    @ButtonComponent("profile")
    async profile(interaction: ButtonInteraction){
        let profileMessage: IProfileMessagePair|undefined = this.socialService.profileMessages.filter(x => x.message.id == interaction.message.id)[0];
        let msg: Message = interaction.message as Message;
        if(!profileMessage)
            return await msg.delete();

        let member: GuildMember = profileMessage.member;
        let userRating: IUserRating = await this.socialService.userRatingService.getOne(member.guild.id, member.id);
        let userTimings: IUserTimings = await this.socialService.userTimingsService.getOne(member.guild.id, member.id);

        await interaction.reply({embeds: signEmbed(interaction, this.socialService.socialEmbeds.stats(member.user, userRating, userTimings))})
    }
}
