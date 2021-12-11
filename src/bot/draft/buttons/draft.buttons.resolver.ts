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

            // Потенциально опасный код,
            // потому что объект с нужной
            // игрой может быть не найден
            let draftEmbedObject: DraftEmbedObject = this.draftService.draftEmbedObjectArray.filter((x: DraftEmbedObject) => (x.isProcessing) && (x.users.indexOf(interaction.user) != -1))[0];

            let userNumber: number = draftEmbedObject.users.indexOf(interaction.user);
            let civilizationNumber: number = Number(interaction.customId.slice(interaction.customId.indexOf("-") + 1));

            draftEmbedObject.draft[userNumber] = [draftEmbedObject.draft[userNumber][civilizationNumber]];
            draftEmbedObject.usersReadyBlind[userNumber] = true;

            await msg.edit({embeds: [this.draftService.draftEmbeds.draftBlindPmReady(draftEmbedObject, userNumber)], components: []});
            if((draftEmbedObject.usersReadyBlind.filter(x => x)).length == draftEmbedObject.users.length) {
                draftEmbedObject.isProcessing = false;
                return await draftEmbedObject.interaction.editReply({embeds: [this.draftService.draftEmbeds.draftBlindProcessing(draftEmbedObject)], components: []});
            }
            return await draftEmbedObject.interaction.editReply({embeds: [this.draftService.draftEmbeds.draftBlindProcessing(draftEmbedObject)]});
        } catch (buttonError) {
            let msg = interaction.message as Message;
            if(msg)
                await msg.delete();
        }
    }

    @ButtonComponent("redraftButton-yes")
    async redraftButtonYes(interaction: ButtonInteraction){
        try{
            let msg = interaction.message as Message;

            // Потенциально опасный код,
            // потому что объект с нужной
            // игрой может быть не найден
            let draftEmbedObject: DraftEmbedObject = this.draftService.draftEmbedObjectArray.filter((x: DraftEmbedObject) => (x.isProcessing) && (x.users.indexOf(interaction.user) != -1))[0];
            let userNumber: number = draftEmbedObject.users.indexOf(interaction.user);

            if(userNumber == -1)
                return interaction.reply({embeds: [this.draftService.botlibEmbeds.error("Вы не были участником игры, в голосовании которой вы пытаетесь принять участие.")], ephemeral: true});

            draftEmbedObject.redraftStatus[userNumber] = 1;
            if(draftEmbedObject.redraftStatus.filter(x => (x == 1)).length >= draftEmbedObject.redraftMinAmount)
                draftEmbedObject.redraftResult = 1;

            if(draftEmbedObject.redraftResult == 1){
                draftEmbedObject.isProcessing = false;
                await msg.edit({ embeds: [this.draftService.draftEmbeds.redraftProcessing(draftEmbedObject)], components: [] });
                setTimeout(async () => {await this.draftService.runRedraft(draftEmbedObject);}, 3000);
            } else
                await msg.edit({ embeds: [this.draftService.draftEmbeds.redraftProcessing(draftEmbedObject)] });
            return;
        } catch (buttonError){
            return;
        }
    }

    @ButtonComponent("redraftButton-no")
    async redraftButtonNo(interaction: ButtonInteraction){
        try{
            let msg = interaction.message as Message;

            // Потенциально опасный код,
            // потому что объект с нужной
            // игрой может быть не найден
            let draftEmbedObject: DraftEmbedObject = this.draftService.draftEmbedObjectArray.filter((x: DraftEmbedObject) => (x.isProcessing) && (x.users.indexOf(interaction.user) != -1))[0];
            let userNumber: number = draftEmbedObject.users.indexOf(interaction.user);

            if(userNumber == -1)
                return interaction.reply({embeds: [this.draftService.botlibEmbeds.error("Вы не принимаете участие в данной игре.")], ephemeral: true});

            draftEmbedObject.redraftStatus[userNumber] = 0;
            if(draftEmbedObject.redraftStatus.filter(x => (x == 0)).length >= draftEmbedObject.users.length-draftEmbedObject.redraftMinAmount+1)
                draftEmbedObject.redraftResult = 0;

            if(draftEmbedObject.redraftResult == 0){
                await msg.edit({ embeds: [this.draftService.draftEmbeds.redraftProcessing(draftEmbedObject)], components: [] });
                this.draftService.draftEmbedObjectArray.splice(this.draftService.draftEmbedObjectArray.indexOf(draftEmbedObject), 1)
            } else
                await msg.edit({ embeds: [this.draftService.draftEmbeds.redraftProcessing(draftEmbedObject)] });
            return;
        } catch (buttonError){
            return;
        }
    }

    @ButtonComponent("blindDelete")
    async blindDelete(interaction: ButtonInteraction){
        let draftEmbedObject: DraftEmbedObject = this.draftService.draftEmbedObjectArray.filter((x: DraftEmbedObject) => (x.isProcessing) && (x.users.indexOf(interaction.user) != -1))[0];
        if(!draftEmbedObject)
            return;
        if((draftEmbedObject.interaction.user != interaction.user) || (draftEmbedObject.interaction.guildId != interaction.guildId))
            return;
        this.draftService.draftEmbedObjectArray.splice(this.draftService.draftEmbedObjectArray.indexOf(draftEmbedObject), 1);
        await draftEmbedObject.interaction.deleteReply();
        for(let i in draftEmbedObject.pmArray)
            await draftEmbedObject.pmArray[i].delete();
    }
}
