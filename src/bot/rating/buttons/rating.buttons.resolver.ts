import {ButtonComponent, Discord} from "discordx";
import {ButtonInteraction, Message} from "discord.js";
import {RatingService} from "../rating.service";
import {BotlibEmbeds} from "../../../botlib/botlib.embeds";
import {RatingObject} from "../rating.models";
import {PermissionsService} from "../../permissions/permissions.service";

@Discord()
export abstract class RatingButtonsResolver{
    permissionsService: PermissionsService = PermissionsService.Instance;
    ratingService: RatingService = RatingService.Instance;
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();

    @ButtonComponent("rating-cancel")
    async reportDelete(interaction: ButtonInteraction){
        let ratingObject: RatingObject|undefined = this.ratingService.ratingReports.filter(x => x.message?.id == interaction.message.id)[0];
        let msg: Message = interaction.message as Message;
        if(!ratingObject) {
            await interaction.reply({embeds: this.botlibEmbeds.error("Данный отчет был не индексирован из-за превышения срока ожидания, поэтому был удален."), ephemeral: true});
            return await msg.delete();
        }
        if(!(this.permissionsService.getUserPermissionStatus(interaction, 2) || (ratingObject.interaction.user.id == interaction.user.id)))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для удаления отчета о рейтинге."), ephemeral: true});
        await interaction.reply({embeds: this.botlibEmbeds.notify("🗑️ Отчет о рейтинге был успешно удален."), ephemeral: true});
        this.ratingService.ratingReports.splice(this.ratingService.ratingReports.indexOf(ratingObject), 1);
        await msg.delete();
    }

    @ButtonComponent("rating-confirm")
    async reportConfirm(interaction: ButtonInteraction){
        let ratingObject: RatingObject|undefined = this.ratingService.ratingReports.filter(x => x.message?.id == interaction.message.id)[0];
        let msg: Message = interaction.message as Message;
        if(!ratingObject) {
            await interaction.reply({embeds: this.botlibEmbeds.error("Данный отчет был не индексирован из-за превышения срока ожидания, поэтому был удален. Попросите автора переписать отчет снова."), ephemeral: true});
            return await msg.delete();
        }
        if(!this.permissionsService.getUserPermissionStatus(interaction, 2))
            return await interaction.reply({embeds: this.botlibEmbeds.error("У вас нет прав для подтверждения отчета о рейтинге."), ephemeral: true});
        this.ratingService.ratingReports.splice(this.ratingService.ratingReports.indexOf(ratingObject), 1);
        ratingObject.interaction = interaction;
        await msg.edit({embeds: await this.ratingService.applyRating(ratingObject, true), components: []});
        await interaction.reply({embeds: this.botlibEmbeds.notify("🔨 Отчет о рейтинге был успешно подтвержден."), ephemeral: true});
        setTimeout( async () => await msg.delete(), 5000);
    }
}
