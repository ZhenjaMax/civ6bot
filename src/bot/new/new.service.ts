import {CommandInteraction, Message, MessageReaction, ReactionCollector, TextChannel, User} from "discord.js";
import {NewVote, NewVoteObjectBlank, NewVoteObjectCaptains, NewVoteObjectCommon, NewVoteObjectDraft} from "./new.models";
import {BotlibEmbeds} from "../../botlib/botlib.embeds";
import {NewConfig} from "./new.config";
import {NewButtons} from "./buttons/new.buttons";
import * as schedule from "node-schedule";
import {NewEmbeds} from "./new.embeds";
import {AdapterNew} from "../adapters/adapter.new";

export class NewService{
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();
    newConfig: NewConfig = new NewConfig();
    newButtons: NewButtons = new NewButtons();
    newVoteArray: NewVote[] = [];
    newEmbeds: NewEmbeds = new NewEmbeds();
    adapterNew: AdapterNew = new AdapterNew();

    private static _instance: NewService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    private async checkNew(newVote: NewVote): Promise<boolean>{
        if(newVote.users.length == 0){
            await newVote.interaction.reply({embeds: this.botlibEmbeds.error("Для выполнения этой команды вы должны находиться в голосовом канале.")});
            return false;
        }
        if(newVote.users.length < this.newConfig.newPlayersMin){
            await newVote.interaction.reply({embeds: this.botlibEmbeds.error(`Для выполнения этой команды необходимо минимум ${this.newConfig.newPlayersMin} игрока.`)});
            return false;
        }
        let currentNewVote: NewVote | undefined = this.newVoteArray.filter(x => ((x.isProcessing) && (x.guildID == newVote.interaction.guildId)))[0];
        if(currentNewVote != undefined){
            await newVote.interaction.reply({embeds: this.botlibEmbeds.error("В данный момент уже проводится голосование. Пожалуйста, подождите."), ephemeral: true});
            return false;
        }
        return true;
    }

    async getNew(interaction: CommandInteraction, type: "FFA" | "Teamers"){
        let currentNewVote = new NewVote(interaction, type);
        if(!await this.checkNew(currentNewVote))
            return;
        this.newVoteArray.push(currentNewVote);

        schedule.scheduleJob(new Date().setTime(new Date().getTime() + this.newConfig.votingTime), scheduleNew);
        let options: string[][] = (currentNewVote.type == "FFA") ? this.newConfig.newOptionsFFA : this.newConfig.newOptionsTeamers;
        let emojis: string[][] = (currentNewVote.type == "FFA") ? this.newConfig.newOptionHeadersEmojisFFA : this.newConfig.newOptionHeadersEmojisTeamers;

        for(let i in options)
            currentNewVote.newVoteObjects.push(new NewVoteObjectCommon(options[i][0], options[i].slice(1), emojis[i]));
        if(currentNewVote.type == "Teamers")
            currentNewVote.newVoteObjects.push(new NewVoteObjectCaptains(this.newConfig.newCaptainTeamers, currentNewVote.users));
        currentNewVote.newVoteObjects.push(new NewVoteObjectDraft(this.newConfig.newBan, currentNewVote.users.length));
        currentNewVote.newVoteObjects.push(new NewVoteObjectBlank("")); // "Готов"

        let msg: Message = await interaction.reply({
            content: currentNewVote.newVoteObjects[0].getContent(),
            fetchReply: true
        }) as Message;
        let collector: ReactionCollector = msg.createReactionCollector( {time: this.newConfig.votingTime});
        currentNewVote.newVoteObjects[0].init(msg, collector);
        collector.on("collect", async (reaction: MessageReaction, user: User) => {await collectorNew(reaction, user);});
        for(let emoji of currentNewVote.newVoteObjects[0].emojis)
            await currentNewVote.newVoteObjects[0].message?.react(emoji);

        let channel: TextChannel = msg.channel as TextChannel;
        for(let i: number = 1; i < currentNewVote.newVoteObjects.length-1; i++){
            msg = await channel.send({
                content: currentNewVote.newVoteObjects[i].getContent()
            }) as Message;
            collector = msg.createReactionCollector( {time: this.newConfig.votingTime});
            currentNewVote.newVoteObjects[i].init(msg, collector);
            collector.on("collect", async (reaction: MessageReaction, user: User) => {await collectorNew(reaction, user);});
            if(i == currentNewVote.newVoteObjects.length-2)
                await currentNewVote.newVoteObjects[i].message?.react(this.newConfig.newBanMessageEmoji);
            else
                for(let emoji of currentNewVote.newVoteObjects[i].emojis)
                    await currentNewVote.newVoteObjects[i].message?.react(emoji);
        }

        msg = await channel.send({
            embeds: [this.newEmbeds.readyForm(currentNewVote)],
            components: this.newButtons.newPlayersRow()
        });
        collector = msg.createReactionCollector( {time: this.newConfig.votingTime});
        currentNewVote.newVoteObjects[currentNewVote.newVoteObjects.length-1].init(msg, collector);
        collector.on("collect", async (reaction: MessageReaction, user: User) => {await collectorNew(reaction, user);});
    }

    async resolve(currentNewVote: NewVote){
        if(!currentNewVote.isProcessing)
            return;
        currentNewVote.isProcessing = false;
        await currentNewVote.resolve();
    }
}

export async function scheduleNew(){
    let newConfig: NewConfig = new NewConfig();
    let newService: NewService = NewService.Instance;
    let currentNewVote: NewVote | undefined = newService.newVoteArray.filter(x => (x.isProcessing) && (new Date().getTime() - x.date.getTime() >= newConfig.votingTime))[0];
    if(currentNewVote)
        if(currentNewVote.isProcessing)
            await newService.resolve(currentNewVote);
}

export async function collectorNew(reaction: MessageReaction, user: User){
    if(user.bot)
        return;
    let msg: Message = reaction.message as Message;
    let currentVote: NewVote | undefined = NewService.Instance.newVoteArray.filter((x) => x.isProcessing && (x.interaction.guild?.id == msg.guild?.id))[0];

    if(!currentVote)
        return await msg.delete();
    let voteIndex: number = currentVote.newVoteObjects.map(x => x.message?.id).indexOf(msg.id);
    if(voteIndex == -1)
        return await msg.delete();
    if((currentVote.newVoteObjects[voteIndex].emojis.indexOf(reaction.emoji.toString().toLowerCase()) == -1) || (currentVote.users.indexOf(user) == -1))
        return await msg.reactions.resolve(reaction).users.remove(user);

    if(voteIndex == currentVote.newVoteObjects.length-2){   // Баны цивилизаций
        let draftObject: NewVoteObjectDraft = currentVote.newVoteObjects[voteIndex] as NewVoteObjectDraft;
        if(await draftObject.resolveProcessing(reaction))
            await msg.edit({content: draftObject.getContentProcessing()});
    }
}
