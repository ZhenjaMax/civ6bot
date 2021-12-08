import {ButtonComponent, Discord} from "discordx";
import {ButtonInteraction, Message} from "discord.js";
import {DraftEmbedObject} from "../draft.models";
import {DraftService} from "../draft.service";

// Я не могу удалить сообщение
// которое не было отправлено при
// текущей сессии работы бота

@Discord()
export abstract class DraftButtonsResolver{
    draftService: DraftService = DraftService.Instance;

    // Это выглядит ужасно,
    // и я не знаю, можно ли назначить
    // компоненты корректным образом
    @ButtonComponent("blindDraftButton-0")
    @ButtonComponent("blindDraftButton-1")
    @ButtonComponent("blindDraftButton-2")
    @ButtonComponent("blindDraftButton-3")
    @ButtonComponent("blindDraftButton-4")
    @ButtonComponent("blindDraftButton-5")
    @ButtonComponent("blindDraftButton-6")
    @ButtonComponent("blindDraftButton-7")
    @ButtonComponent("blindDraftButton-8")
    @ButtonComponent("blindDraftButton-9")
    @ButtonComponent("blindDraftButton-10")
    @ButtonComponent("blindDraftButton-11")
    @ButtonComponent("blindDraftButton-12")
    @ButtonComponent("blindDraftButton-13")
    @ButtonComponent("blindDraftButton-14")
    @ButtonComponent("blindDraftButton-15")
    async blindDraftButton(interaction: ButtonInteraction) {
        try {
            let msg = interaction.message as Message;
            let draftEmbedObject = this.draftService.lastDraftEmbedObject as DraftEmbedObject;
            let userNumber: number = draftEmbedObject.users.indexOf(interaction.user);
            let civilizationNumber: number = Number(interaction.customId.slice(interaction.customId.indexOf("-") + 1));

            draftEmbedObject.draft[userNumber] = [draftEmbedObject.draft[userNumber][civilizationNumber]];
            draftEmbedObject.usersReadyBlind[userNumber] = true;

            await msg.edit({embeds: [this.draftService.draftEmbeds.draftBlindPmReady(draftEmbedObject, userNumber)], components: []});
            if((draftEmbedObject.usersReadyBlind.filter(x => x)).length == draftEmbedObject.users.length)
                draftEmbedObject.isProcessing = false;
            await draftEmbedObject.interaction.editReply({embeds: [this.draftService.draftEmbeds.draftBlindProcessing(draftEmbedObject)]});
        } catch (buttonError) {
            return;
        }
    }

    @ButtonComponent("redraftButton-yes")
    redraftButtonYes(interaction: ButtonInteraction){
        try{
            let msg = interaction.message as Message;
            let draftEmbedObject = this.draftService.lastDraftEmbedObject as DraftEmbedObject;
            let userNumber: number = draftEmbedObject.users.indexOf(interaction.user);

            if(userNumber == -1){
                interaction.reply({embeds: [this.draftService.botlibEmbeds.error("Вы не были участником игры, в голосовании которой вы пытаетесь принять участие.")], ephemeral: true});
                return;
            }

            draftEmbedObject.redraftStatus[userNumber] = 1;
            if(draftEmbedObject.redraftStatus.filter(x => (x == 1)).length >= draftEmbedObject.redraftMinAmount)
                draftEmbedObject.redraftResult = 1;

            if(draftEmbedObject.redraftResult == 1){
                draftEmbedObject.isProcessing = false;
                msg.edit({ embeds: [this.draftService.draftEmbeds.redraftProcessing(draftEmbedObject)], components: [] });
                draftEmbedObject.redraftCounter += 1;
                draftEmbedObject.redraftResult = -1;
                setTimeout((): void => {this.draftService.runRedraft(draftEmbedObject);}, 3000);
            } else
                msg.edit({ embeds: [this.draftService.draftEmbeds.redraftProcessing(draftEmbedObject)] });
            return;
        } catch (buttonError){
            return;
        }
    }

    @ButtonComponent("redraftButton-no")
    redraftButtonNo(interaction: ButtonInteraction){
        try{
            let msg = interaction.message as Message;
            let draftEmbedObject = this.draftService.lastDraftEmbedObject as DraftEmbedObject;
            let userNumber: number = draftEmbedObject.users.indexOf(interaction.user);

            if(userNumber == -1){
                interaction.reply({embeds: [this.draftService.botlibEmbeds.error("Вы не принимаете участие в данной игре.")], ephemeral: true});
                return;
            }

            draftEmbedObject.redraftStatus[userNumber] = 0;
            if(draftEmbedObject.redraftStatus.filter(x => (x == 0)).length >= draftEmbedObject.users.length-draftEmbedObject.redraftMinAmount+1)
                draftEmbedObject.redraftResult = 0;

            if(draftEmbedObject.redraftResult == 0){
                msg.edit({ embeds: [this.draftService.draftEmbeds.redraftProcessing(draftEmbedObject)], components: [] });
                delete this.draftService.lastDraftEmbedObject;
            } else
                msg.edit({ embeds: [this.draftService.draftEmbeds.redraftProcessing(draftEmbedObject)] });
            return;
        } catch (buttonError){
            return;
        }
    }
}
