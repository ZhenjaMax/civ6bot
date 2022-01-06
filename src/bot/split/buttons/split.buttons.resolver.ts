import {ButtonComponent, Discord} from "discordx";
import {ButtonInteraction, Message} from "discord.js";
import {SplitObject} from "../split.models";
import {SplitService} from "../split.service";
import {BotlibEmbeds} from "../../../botlib/botlib.embeds";

@Discord()
export abstract class SplitButtonsResolver{
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();
    splitService: SplitService = SplitService.Instance;

    @ButtonComponent("split-delete")
    async splitDelete(interaction: ButtonInteraction){
        let msg: Message = interaction.message as Message;
        let currentSplit: SplitObject = this.splitService.splitObjectArray.filter(x => (x.isProcessing && (x.message?.id == msg.id)))[0];
        if(!currentSplit)
            return await msg.delete();

        if((currentSplit.interaction.user.id == interaction.user.id) || (currentSplit.captains.filter(x => (x.id == interaction.user.id)).length == 1)){
            currentSplit.isProcessing = false;
            await interaction.deferUpdate();
            return await msg.delete();
        } else
            return await interaction.reply({embeds: this.botlibEmbeds.error("Вы не являетесь капитаном команды или автором.")});
    }
}
