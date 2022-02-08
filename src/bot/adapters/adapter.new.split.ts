import {collectorSplit, SplitService} from "../split/split.service";
import {NewVote} from "../new/new.models";
import {SplitObject} from "../split/split.models";
import {Message, MessageReaction, ReactionCollector, TextChannel, User} from "discord.js";

export class AdapterNewSplit {
    splitService: SplitService = SplitService.Instance;

    async getSplit(newVote: NewVote){
        let splitObject: SplitObject = new SplitObject(
            newVote.interaction,
            newVote.captains.map(x => newVote.users[x]),
            newVote.users.filter(x => newVote.captains.indexOf(newVote.users.indexOf(x)) == -1)
        );
        let channel: TextChannel = splitObject.interaction.channel as TextChannel;

        let currentSplit: SplitObject | undefined = this.splitService.splitObjectArray.filter(x => ((x.isProcessing) && (x.guildID == splitObject.interaction.guildId)))[0];
        if(currentSplit){
            if(currentSplit.isProcessing){
                await channel.send({embeds: this.splitService.botlibEmbeds.error("В данный момент уже проводится деление на команды. Пожалуйста, подождите.")});
                return false;
            }
            this.splitService.splitObjectArray[this.splitService.splitObjectArray.indexOf(currentSplit)] = splitObject;
        } else
            this.splitService.splitObjectArray.push(splitObject);
        if(splitObject.users.length < this.splitService.splitConfig.minUsers)
            return await channel.send({embeds: this.splitService.botlibEmbeds.error(`Для выполнения этой команды необходимо минимум ${this.splitService.splitConfig.minUsers} игрока кроме капитанов.`)});

        let msg: Message = await channel.send({
            embeds: [this.splitService.splitEmbeds.splitProcessing(splitObject)],
            components: this.splitService.splitButtons.splitRow()
        });
        let collector: ReactionCollector = msg.createReactionCollector( {time: this.splitService.splitConfig.time});
        splitObject.init(msg, collector);
        splitObject.initNew(newVote);
        try {
            collector.on("collect", async (reaction: MessageReaction, user: User) => {await collectorSplit(reaction, user)});
            for(let i in splitObject.emojis)
                splitObject.reactions.push(await splitObject.message?.react(splitObject.emojis[i]) as MessageReaction);
        } catch {
            splitObject.isProcessing = false;
            return;
        }
    }
}
