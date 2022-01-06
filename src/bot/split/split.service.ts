import {CommandInteraction, GuildChannel, GuildMember, Message, MessageReaction, ReactionCollector, User} from "discord.js";
import {SplitObject} from "./split.models";
import {BotlibEmbeds} from "../../botlib/botlib.embeds";
import {SplitConfig} from "./split.config";
import {SplitEmbeds} from "./split.embeds";
import {SplitButtons} from "./buttons/split.buttons";
import {AdapterSplitDraft} from "../adapters/adapter.split.draft";

export class SplitService{
    splitEmbeds: SplitEmbeds = new SplitEmbeds();
    splitConfig: SplitConfig = new SplitConfig();
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();
    splitButtons: SplitButtons = new SplitButtons();
    splitObjectArray: SplitObject[] = [];
    adapterSplitDraft: AdapterSplitDraft = new AdapterSplitDraft();

    private static _instance: SplitService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    private async checkSplit(splitObject: SplitObject): Promise<boolean>{
        if(splitObject.users.length == 0){
            await splitObject.interaction.reply({embeds: this.botlibEmbeds.error("Для выполнения этой команды вы должны находиться в голосовом канале.")});
            return false;
        }
        if(splitObject.captains.length == 0){
            await splitObject.interaction.reply({embeds: this.botlibEmbeds.error("Для выполнения этой команды капитаны должны находиться в одном голосовом канале.")});
            return false;
        }
        if(splitObject.users.length < this.splitConfig.minUsers) {
            await splitObject.interaction.reply({embeds: this.botlibEmbeds.error(`Для выполнения этой команды необходимо минимум ${this.splitConfig.minUsers} игрока кроме капитанов.`)});
            return false;
        }
        if(splitObject.captains[0] == splitObject.captains[1]){
            await splitObject.interaction.reply({embeds: this.botlibEmbeds.error(`Введите двух разных игроков-капитанов или одного игрока, но не себя.`)});
            return false;
        }
        let currentSplit: SplitObject | undefined = this.splitObjectArray.filter(x => ((x.isProcessing) && (x.guildID == splitObject.interaction.guildId)))[0];
        if(currentSplit){
            if(currentSplit.isProcessing){
                await splitObject.interaction.reply({embeds: this.botlibEmbeds.error("В данный момент уже проводится деление на команды. Пожалуйста, подождите."), ephemeral: true});
                return false;
            }
            this.splitObjectArray[this.splitObjectArray.indexOf(currentSplit)] = splitObject;
        } else
            this.splitObjectArray.push(splitObject);
        return true;
    }

    async split(interaction: CommandInteraction, captains: User[]){
        let currentSplit: SplitObject = new SplitObject(interaction, captains);
        if(!await this.checkSplit(currentSplit))
            return;
        let msg: Message = await interaction.reply({
            embeds: [this.splitEmbeds.splitProcessing(currentSplit)],
            components: this.splitButtons.splitRow(),
            fetchReply: true
        }) as Message;
        let collector: ReactionCollector = msg.createReactionCollector( {time: this.splitConfig.time});
        currentSplit.init(msg, collector);
        try{
            collector.on("collect", async (reaction: MessageReaction, user: User) => {await collectorSplit(reaction, user)});
            for(let i in currentSplit.emojis)
                currentSplit.reactions.push(await currentSplit.message?.react(currentSplit.emojis[i]) as MessageReaction);
        } catch (splitError) {
            currentSplit.isProcessing = false;
            return;
        }
    }

    async splitRandom(interaction: CommandInteraction, rawCaptains: (User|undefined)[]){
        let captains: User[] = [];
        for(let i in rawCaptains)
            if(rawCaptains[i])
                captains.push(rawCaptains[i] as User);
        if(captains.length != 2){
            let member = interaction.member as GuildMember;
            let channel = member.voice.channel as GuildChannel;
            if(channel == null)
                return interaction.reply({embeds: this.botlibEmbeds.error("Для выполнения этой команды вы должны находиться в голосовом канале.")});
            let users: User[] = Array.from(channel.members.values()).map((member): User => {return member.user});
            for(let i in captains)
                if(users.indexOf(captains[i]) == -1)
                    return await interaction.reply({embeds: this.botlibEmbeds.error("Для выполнения этой команды капитаны должны находиться в одном голосовом канале.")});
            for(let i = 0; i < users.length; i++){
                if(users[i].bot || (captains.indexOf(users[i]) != -1)){
                    users.splice(i, 1);
                    i--;
                }
            }
            while (captains.length != 2)
                captains.push(users.splice(Math.floor(Math.random()*users.length), 1)[0]);
        }
        let currentSplit: SplitObject = new SplitObject(interaction, captains);
        if(currentSplit.captains[0] == currentSplit.captains[1])
            return await currentSplit.interaction.reply({embeds: this.botlibEmbeds.error(`Введите двух разных игроков-капитанов или одного игрока, но не себя.`)});
        currentSplit.random();
        return await interaction.reply({embeds: [this.splitEmbeds.splitResult(currentSplit, true)]});
    }
}

export async function collectorSplit(reaction: MessageReaction, user: User){
    if(user.bot)
        return;
    let msg: Message = reaction.message as Message;
    let currentSplit: SplitObject | undefined = SplitService.Instance.splitObjectArray.filter(x => x.isProcessing && (x.interaction.guild?.id == msg.guild?.id))[0];
    if(!currentSplit)
        return await msg.delete();
    await msg.reactions.resolve(reaction).users.remove(user);
    let emojiIndex: number = currentSplit.emojis.indexOf(reaction.emoji.toString().toLowerCase());
    if((emojiIndex == -1) || (user != currentSplit.captains[currentSplit.pickOrder[0]]))
        return;
    let lastReaction: MessageReaction = currentSplit.reactions.pop() as MessageReaction;
    await lastReaction.remove();
    currentSplit.updateOptions(emojiIndex);
    let splitEmbeds: SplitEmbeds = new SplitEmbeds();
    if(currentSplit.step > currentSplit.stepTotal){
        if(currentSplit.commands[0].length != currentSplit.commands[1].length)
            currentSplit.updateOptions(0);
        currentSplit.message?.edit({
            embeds: [splitEmbeds.splitResult(currentSplit)],
            components: []
        });
        currentSplit.isProcessing = false;
        await currentSplit.message?.reactions.removeAll();
        await currentSplit.messageEmojisCollector?.stop();
        if(currentSplit.newVote)
            return await SplitService.Instance.adapterSplitDraft.getDraftFromSplit(currentSplit);
        return;
    }
    await currentSplit.message?.edit({embeds: [splitEmbeds.splitProcessing(currentSplit)]});
}
