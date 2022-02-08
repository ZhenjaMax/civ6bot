import {SplitObject} from "../split/split.models";
import {DraftEmbedObject} from "../draft/draft.models";
import {DraftService} from "../draft/draft.service";
import {signEmbed} from "../../botlib/botlib.embeds";
import {CommandInteraction, TextChannel, User} from "discord.js";

export class AdapterSplitDraft{
    draftService: DraftService = DraftService.Instance;

    async getDraftFromSplit(currentSplit: SplitObject){
        let DEO = new DraftEmbedObject(currentSplit.interaction, await this.draftService.guildConfigService.getOne(currentSplit.interaction.guildId), 2, currentSplit.newVote?.bans as string);
        DEO.initNew(currentSplit.newVote?.users as User[], currentSplit.newVote?.botsCount as number);
        this.draftService.draftEmbedObjectRoutine.setType(DEO, currentSplit.newVote?.type);
        let channel: TextChannel = currentSplit.newVote?.interaction.channel as TextChannel;
        if(DEO.draft[0] == undefined)
            return await channel.send({embeds: signEmbed(currentSplit.newVote?.interaction as CommandInteraction, this.draftService.botlibEmbeds.error("Недостаточно цивилизаций для такого драфта."))});
        let lastDEO: DraftEmbedObject | undefined = this.draftService.draftEmbedObjectArray.filter((x: DraftEmbedObject) => (x.guildID == DEO.guildID))[0];
        if(lastDEO) {
            if(lastDEO.isProcessing)
                return await channel.send({embeds: signEmbed(currentSplit.newVote?.interaction as CommandInteraction, this.draftService.botlibEmbeds.error("В данный момент уже проводится драфт. Пожалуйста, подождите."))});
            this.draftService.draftEmbedObjectArray.splice(this.draftService.draftEmbedObjectArray.indexOf(lastDEO), 1);
        }
        this.draftService.draftEmbedObjectArray.push(DEO);
        await channel.send({embeds: signEmbed(currentSplit.newVote?.interaction as CommandInteraction, this.draftService.draftEmbeds.draftTeamers(DEO))});
    }
}
