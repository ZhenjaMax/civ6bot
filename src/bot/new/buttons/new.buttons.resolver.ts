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

    @ButtonComponent(/new-\d+-\d+/)
    async newOptionButton(interaction: ButtonInteraction) {
        await interaction.deferUpdate();
        let currentNewVote: NewVote = this.newService.newVoteArray.filter((x: NewVote) => (x.isProcessing && (x.interaction.guildId == interaction.guildId)))[0];
        if(!currentNewVote) {
            let msg = interaction.message as Message;
            return await msg.delete();
        }
        let userIndex = currentNewVote.users.indexOf(interaction.user);
        if(userIndex == -1)
            return interaction.reply({embeds: this.botlibEmbeds.error("Вы не являетесь участником игры, в голосовании для которой вы пытаетесь принять участие."), ephemeral: true});
        let buttonID: string = interaction.customId.slice(4);
        let voteIndex: number = Number(buttonID.slice(0, buttonID.indexOf("-")));
        let optionIndex: number = Number(buttonID.slice(buttonID.indexOf("-")+1));
        currentNewVote.newVoteObjects[voteIndex].updateVote(userIndex, optionIndex);
        await currentNewVote.messages[voteIndex].edit({ embeds: [this.newEmbeds.voteForm(currentNewVote, voteIndex)]});
    }

    @ButtonComponent("new-ready")
    async newPlayerReady(interaction: ButtonInteraction) {
        await interaction.deferUpdate();
        let currentNewVote: NewVote = this.newService.newVoteArray.filter((x: NewVote) => (x.isProcessing && (x.interaction.guildId == interaction.guildId)))[0];
        if(!currentNewVote) {
            let msg = interaction.message as Message;
            return await msg.delete();
        }
        let userIndex = currentNewVote.users.indexOf(interaction.user);
        if(userIndex == -1)
            return interaction.reply({embeds: this.botlibEmbeds.error("Вы не являетесь участником игры, в голосовании для которой вы пытаетесь принять участие."), ephemeral: true});
        currentNewVote.ready[userIndex] = 1;
        if(currentNewVote.ready.filter(x => x==1).length == currentNewVote.users.length){
            currentNewVote.resolveAll();
            for(let i: number = 0; i < currentNewVote.newVoteObjects.length; i++)
                await currentNewVote.messages[i].edit({
                    embeds: [this.newEmbeds.voteForm(currentNewVote, i)],
                    components: []
                });
            await currentNewVote.messages[currentNewVote.messages.length-1].delete();
        }
    }
}
