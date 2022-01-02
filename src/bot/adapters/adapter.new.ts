import {NewVote} from "../new/new.models";
import {DraftService} from "../draft/draft.service";
import {DraftEmbedObject} from "../draft/draft.models";
import {signEmbed} from "../../botlib/botlib.embeds";
import {MessageEmbed, TextChannel, User} from "discord.js";

export class AdapterNew{
    draftService: DraftService = DraftService.Instance;

    async getDraftFromNew(newVote: NewVote){
        let DEO = new DraftEmbedObject(newVote.interaction, (newVote.type == "FFA") ? 0 : 2, newVote.bans);
        DEO.initNew(newVote.users, newVote.botsCount);
        if(newVote.draftTypeFFA == "Blind")
            this.draftService.draftEmbedObjectRoutine.setType(DEO, newVote.draftTypeFFA);
        else
            this.draftService.draftEmbedObjectRoutine.setType(DEO, newVote.type);
        let channel: TextChannel = newVote.interaction.channel as TextChannel;

        if(DEO.draft[0] == undefined)
            return await channel.send({embeds: signEmbed(newVote.interaction, this.draftService.botlibEmbeds.error("Недостаточно цивилизаций для такого драфта."))});
        let lastDEO: DraftEmbedObject | undefined = this.draftService.draftEmbedObjectArray.filter((x: DraftEmbedObject) => (x.guildID == DEO.guildID))[0];
        if(lastDEO) {
            if(lastDEO.isProcessing)
                return await channel.send({embeds: signEmbed(newVote.interaction, this.draftService.botlibEmbeds.error("В данный момент уже проводится драфт. Пожалуйста, подождите."))});
            this.draftService.draftEmbedObjectArray[this.draftService.draftEmbedObjectArray.indexOf(lastDEO)] = DEO;
        } else
            this.draftService.draftEmbedObjectArray.push(DEO);
        switch(DEO.type){
            case "FFA":
                return await channel.send({embeds: signEmbed(newVote.interaction, this.draftService.draftEmbeds.draftFFA(DEO))});
            case "Teamers":
                return await channel.send({embeds: signEmbed(newVote.interaction, this.draftService.draftEmbeds.draftTeamers(DEO))});
            case "Blind":
                DEO.isProcessing = true;
                try{
                    DEO.blindChatMessage = await channel.send({
                        embeds: signEmbed(newVote.interaction, this.draftService.draftEmbeds.draftBlindProcessing(DEO)),
                        components: this.draftService.draftButtons.blindDelete()
                    });
                    for(let i: number = 0; i < DEO.users.length; i++)
                        DEO.pmArray.push(await DEO.users[i].send({
                            embeds: [this.draftService.draftEmbeds.draftBlindPm(DEO, i)],
                            components: this.draftService.draftButtons.blindPmRows(DEO, i)
                        }));
                } catch (blindError) {
                    DEO.isProcessing = false;
                    this.draftService.draftEmbedObjectArray.splice(this.draftService.draftEmbedObjectArray.indexOf(DEO), 1);
                    DEO.pmArray.forEach(x => x.delete());
                    let user: User = DEO.users[DEO.pmArray.length];
                    console.log(DEO);
                    console.log(DEO.pmArray.length);
                    let msg: MessageEmbed[];
                    if(user)
                        msg = this.draftService.botlibEmbeds.error(`Один из игроков (${user.toString()}) заблокировал бота. Провести драфт невозможно.`);
                    else
                        msg = this.draftService.botlibEmbeds.error(`Неизвестная ошибка при исполнении драфта взакрытую.`);
                    return await channel.send({embeds: msg});
                }
        }
    }
}