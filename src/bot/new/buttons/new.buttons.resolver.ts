import {ButtonComponent, Discord} from "discordx";
import {ButtonInteraction, Message} from "discord.js";
import {BotlibEmbeds} from "../../../botlib/botlib.embeds";
import {NewService} from "../new.service";
import {NewEmbeds} from "../new.embeds";
import {NewVote} from "../new.models";

@Discord()
export abstract class NewButtonsResolver{
    newService: NewService = NewService.Instance;
    newEmbeds: NewEmbeds = new NewEmbeds();
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();

    @ButtonComponent("new-delete")
    async newDelete(interaction: ButtonInteraction){
        let currentNewVote: NewVote = this.newService.newVoteArray.filter((x: NewVote) => (x.isProcessing && (x.interaction.guildId == interaction.guildId)))[0];
        if (!currentNewVote) {
            let msg = interaction.message as Message;
            return await msg.delete();
        }
        if(interaction.user.id != currentNewVote.interaction.user.id)
            return interaction.reply({embeds: this.botlibEmbeds.error("Вы не являетесь автором этого голосования."), ephemeral: true});
        if(currentNewVote.isProcessing)
            await currentNewVote.destroy();
    }

    @ButtonComponent("new-ready")
    async newPlayerReady(interaction: ButtonInteraction) {
        let currentNewVote: NewVote = this.newService.newVoteArray.filter((x: NewVote) => (x.isProcessing && (x.interaction.guildId == interaction.guildId)))[0];
        if (!currentNewVote) {
            let msg = interaction.message as Message;
            return await msg.delete();
        }
        let userIndex = currentNewVote.users.indexOf(interaction.user);
        if (userIndex == -1)
            return interaction.reply({embeds: this.botlibEmbeds.error("Вы не являетесь участником игры, в голосовании для которой вы пытаетесь принять участие."), ephemeral: true});
        await interaction.deferUpdate();
        currentNewVote.ready[userIndex] = 1;
        await currentNewVote.newVoteObjects[currentNewVote.newVoteObjects.length-1].message?.edit({embeds: [this.newEmbeds.readyForm(currentNewVote)]});
        let readyCount: number = currentNewVote.ready.filter(x => x == 1).length;
        if(readyCount == currentNewVote.users.length)
            await this.newService.resolve(currentNewVote);
    }
}
