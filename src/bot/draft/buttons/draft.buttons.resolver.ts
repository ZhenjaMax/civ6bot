import {ButtonComponent, Discord} from "discordx";
import {ButtonInteraction, DMChannel, Message, User} from "discord.js";
import {DraftEmbedObject} from "../draft.models";
import {DraftService} from "../draft.service";
import {BotlibEmbeds} from "../../../botlib/botlib.embeds";
import {DraftEmbeds} from "../draft.embeds";

@Discord()
export abstract class DraftButtonsResolver{
    draftService: DraftService = DraftService.Instance;
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();
    draftEmbeds: DraftEmbeds = new DraftEmbeds();

    @ButtonComponent(/blindDraftButton-\d+/)
    async blindDraftButton(interaction: ButtonInteraction) {
        try {
            let msg = interaction.message as Message;
            let draftEmbedObject: DraftEmbedObject = this.draftService.draftEmbedObjectArray.filter((x: DraftEmbedObject) => (x.isProcessing) && (x.users.indexOf(interaction.user) != -1))[0];
            let userNumber: number = draftEmbedObject.users.indexOf(interaction.user);
            let civilizationNumber: number = Number(interaction.customId.slice(interaction.customId.indexOf("-") + 1));

            draftEmbedObject.draft[userNumber] = [draftEmbedObject.draft[userNumber][civilizationNumber]];
            draftEmbedObject.usersReadyBlind[userNumber] = true;

            await msg.edit({embeds: [this.draftEmbeds.draftBlindPmReady(draftEmbedObject, userNumber)], components: []});
            if((draftEmbedObject.usersReadyBlind.filter(x => x)).length == draftEmbedObject.users.length) {
                draftEmbedObject.isProcessing = false;
                if(!draftEmbedObject.blindChatMessage)
                    await draftEmbedObject.interaction.editReply({embeds: [this.draftEmbeds.draftBlindProcessing(draftEmbedObject)], components: []});
                else
                    await draftEmbedObject.blindChatMessage.edit({embeds: [this.draftEmbeds.draftBlindProcessing(draftEmbedObject)], components: []})
                return;
            }
            if(!draftEmbedObject.blindChatMessage)
                await draftEmbedObject.interaction.editReply({embeds: [this.draftEmbeds.draftBlindProcessing(draftEmbedObject)]});
            else
                await draftEmbedObject.blindChatMessage.edit({embeds: [this.draftEmbeds.draftBlindProcessing(draftEmbedObject)]})
        } catch {
            let user: User = interaction.user;
            let dm: DMChannel = await user.createDM();
            let msg = await dm.messages.fetch(interaction.message.id) as Message;
            await msg.delete();
        }
    }

    @ButtonComponent("redraftButton-yes")
    async redraftButtonYes(interaction: ButtonInteraction){
        try{
            let msg = interaction.message as Message;
            let draftEmbedObject: DraftEmbedObject = this.draftService.draftEmbedObjectArray.filter((x: DraftEmbedObject) => (x.isProcessing) && (x.users.indexOf(interaction.user) != -1))[0];
            let userNumber: number = draftEmbedObject.users.indexOf(interaction.user);

            if(userNumber == -1)
                return interaction.reply({embeds: this.botlibEmbeds.error("Вы не являетесь участником игры, в голосовании для которой вы пытаетесь принять участие."), ephemeral: true});

            draftEmbedObject.redraftStatus[userNumber] = 1;
            if(draftEmbedObject.redraftStatus.filter(x => (x == 1)).length >= draftEmbedObject.redraftMinAmount){
                draftEmbedObject.redraftResult = 1;
                draftEmbedObject.isProcessing = false;
                await msg.edit({ embeds: [this.draftEmbeds.redraftProcessing(draftEmbedObject)], components: [] });
                setTimeout(async () => {await this.draftService.runRedraft(draftEmbedObject)}, 2000);
            } else
                await msg.edit({ embeds: [this.draftEmbeds.redraftProcessing(draftEmbedObject)] });
            return await interaction.deferUpdate();
        } catch {
            return;
        }
    }

    @ButtonComponent("redraftButton-no")
    async redraftButtonNo(interaction: ButtonInteraction){
        try{
            let msg = interaction.message as Message;
            let draftEmbedObject: DraftEmbedObject = this.draftService.draftEmbedObjectArray.filter((x: DraftEmbedObject) => (x.isProcessing) && (x.users.indexOf(interaction.user) != -1))[0];
            let userNumber: number = draftEmbedObject.users.indexOf(interaction.user);

            if(userNumber == -1)
                return interaction.reply({embeds: this.botlibEmbeds.error("Вы не являетесь участником игры, в голосовании для которой вы пытаетесь принять участие."), ephemeral: true});

            draftEmbedObject.redraftStatus[userNumber] = 0;
            if(draftEmbedObject.redraftStatus.filter(x => (x == 0)).length >= draftEmbedObject.users.length-draftEmbedObject.redraftMinAmount+1){
                draftEmbedObject.redraftResult = 0;
                await msg.edit({ embeds: [this.draftEmbeds.redraftProcessing(draftEmbedObject)], components: [] });
                this.draftService.draftEmbedObjectArray.splice(this.draftService.draftEmbedObjectArray.indexOf(draftEmbedObject), 1)
            } else
                await msg.edit({embeds: [this.draftEmbeds.redraftProcessing(draftEmbedObject)]});
            await interaction.deferUpdate();
        } catch (buttonError){
            return;
        }
    }

    @ButtonComponent("blindDelete")
    async blindDelete(interaction: ButtonInteraction){
        let draftEmbedObject: DraftEmbedObject = this.draftService.draftEmbedObjectArray.filter((x: DraftEmbedObject) => (x.isProcessing) && (x.users.indexOf(interaction.user) != -1))[0];
        if(!draftEmbedObject)
            return await interaction.reply({embeds: this.botlibEmbeds.error("Вы не являетесь автором драфта."), ephemeral: true});
        if((draftEmbedObject.interaction.user != interaction.user) || (draftEmbedObject.interaction.guildId != interaction.guildId))
            return await interaction.reply({embeds: this.botlibEmbeds.error("Вы не являетесь автором драфта."), ephemeral: true});
        this.draftService.draftEmbedObjectArray.splice(this.draftService.draftEmbedObjectArray.indexOf(draftEmbedObject), 1);
        if(draftEmbedObject.blindChatMessage)
            await draftEmbedObject.blindChatMessage.delete();
        else
            await draftEmbedObject.interaction.deleteReply();
        for(let i in draftEmbedObject.pmArray)
            await draftEmbedObject.pmArray[i].delete();
    }
}
