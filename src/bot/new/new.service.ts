import {CommandInteraction, Guild, GuildMember, Message, MessageReaction, ReactionCollector, TextChannel, User, VoiceChannel} from "discord.js";
import {NewVote, NewVoteObjectBlank, NewVoteObjectCaptains, NewVoteObjectCommon, NewVoteObjectDraft} from "./new.models";
import {BotlibEmbeds} from "../../botlib/botlib.embeds";
import {NewConfig} from "./new.config";
import {NewButtons} from "./buttons/new.buttons";
import * as schedule from "node-schedule";
import {NewEmbeds} from "./new.embeds";
import {AdapterNewDraft} from "../adapters/adapter.new.draft";
import {AdapterNewSplit} from "../adapters/adapter.new.split";

export class NewService{
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();
    newConfig: NewConfig = new NewConfig();
    newButtons: NewButtons = new NewButtons();
    newEmbeds: NewEmbeds = new NewEmbeds();
    newVoteArray: NewVote[] = [];
    adapterNewDraft: AdapterNewDraft = new AdapterNewDraft();
    adapterNewSplit: AdapterNewSplit = new AdapterNewSplit();

    private static _instance: NewService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    private async checkNew(newVote: NewVote): Promise<boolean>{
        if(newVote.users.length == 0){
            await newVote.interaction.editReply({embeds: this.botlibEmbeds.error("Для выполнения этой команды вы должны находиться в голосовом канале.")});
            return false;
        }
        if(newVote.users.length < this.newConfig.newPlayersMin){
            await newVote.interaction.editReply({embeds: this.botlibEmbeds.error(`Для выполнения этой команды необходимо минимум ${this.newConfig.newPlayersMin} игрока.`)});
            return false;
        }
        let currentNewVote: NewVote | undefined = this.newVoteArray.filter(x => (x.guildID == newVote.interaction.guildId))[0];
        if(currentNewVote){
            if(currentNewVote.isProcessing){
                await newVote.interaction.editReply({embeds: this.botlibEmbeds.error("В данный момент уже проводится голосование. Пожалуйста, подождите.")});
                return false;
            }
            this.newVoteArray.splice(this.newVoteArray.indexOf(currentNewVote), 1);
        }
        this.newVoteArray.push(newVote);
        return true;
    }

    async movePlayers(interaction: CommandInteraction, type: "FFA" | "Teamers"){
        let member: GuildMember = interaction.member as GuildMember;
        let guild: Guild = interaction.guild as Guild;
        let currentVoiceChannel: VoiceChannel = member.voice.channel as VoiceChannel;

        let baseChannelID: string[] = (type == "FFA")
            ? [this.newConfig.voiceChannelBasePirateFFA, this.newConfig.voiceChannelBaseLicenseFFA]
            : [this.newConfig.voiceChannelBasePirateTeamers, this.newConfig.voiceChannelBaseLicenseTeamers];
        if(baseChannelID.indexOf(currentVoiceChannel.id) == -1)
            return;

        let typedChannelsID = (type == "FFA")
            ? this.newConfig.voiceChannelsFFA
            : this.newConfig.voiceChannelsTeamers;
        let typedChannels: VoiceChannel[] = [];

        let channelIndex: number = 0, channelMembersAmount: number = 999, currentChannelMembersAmount: number;
        for(let i: number = 0; i < typedChannelsID.length; i++) {
            typedChannels.push(await guild.channels.fetch(typedChannelsID[i]) as VoiceChannel);
            currentChannelMembersAmount = Array.from(typedChannels[i].members.values()).length;
            if(currentChannelMembersAmount == 0){
                channelIndex = i;
                break;
            } else if(currentChannelMembersAmount < channelMembersAmount){
                channelIndex = i;
                channelMembersAmount = currentChannelMembersAmount;
            }
        }
        let members: GuildMember[] = Array.from(currentVoiceChannel.members.values());
        for(let i in members)
            try{
                await members[i].voice.setChannel(typedChannels[channelIndex]);
            } catch (newMovePlayersError) {}

    }

    async getNew(interaction: CommandInteraction, type: "FFA" | "Teamers") {
        await interaction.deferReply();
        await this.movePlayers(interaction, type);

        let currentNewVote = new NewVote(interaction, type);
        if (!await this.checkNew(currentNewVote))
            return;
        schedule.scheduleJob(new Date().setTime(new Date().getTime() + this.newConfig.votingTime), scheduleNew);
        let options: string[][] = (currentNewVote.type == "FFA") ? this.newConfig.newOptionsFFA : this.newConfig.newOptionsTeamers;
        let emojis: string[][] = (currentNewVote.type == "FFA") ? this.newConfig.newOptionHeadersEmojisFFA : this.newConfig.newOptionHeadersEmojisTeamers;

        for (let i in options)
            currentNewVote.newVoteObjects.push(new NewVoteObjectCommon(options[i][0], options[i].slice(1), emojis[i]));
        if (currentNewVote.type == "Teamers")
            currentNewVote.newVoteObjects.push(new NewVoteObjectCaptains(this.newConfig.newCaptainTeamers, currentNewVote.users));
        currentNewVote.newVoteObjects.push(new NewVoteObjectDraft(this.newConfig.newBan, currentNewVote.users.length));
        currentNewVote.newVoteObjects.push(new NewVoteObjectBlank("")); // "Готов"

        let msg: Message = await interaction.editReply({content: currentNewVote.newVoteObjects[0].getContent()}) as Message;
        let collector: ReactionCollector = msg.createReactionCollector({time: this.newConfig.votingTime});
        currentNewVote.newVoteObjects[0].init(msg, collector);
        collector.on("collect", async (reaction: MessageReaction, user: User) => {await collectorNew(reaction, user)});
        for (let emoji of currentNewVote.newVoteObjects[0].emojis)
            await currentNewVote.newVoteObjects[0].message?.react(emoji);

        let channel: TextChannel = msg.channel as TextChannel;
        for (let i: number = 1; i < currentNewVote.newVoteObjects.length-1; i++) {
            msg = await channel.send({content: currentNewVote.newVoteObjects[i].getContent()}) as Message;
            collector = msg.createReactionCollector({time: this.newConfig.votingTime});
            currentNewVote.newVoteObjects[i].init(msg, collector);
            collector.on("collect", async (reaction: MessageReaction, user: User) => {await collectorNew(reaction, user)});
            if (i == currentNewVote.newVoteObjects.length-2)
                await currentNewVote.newVoteObjects[i].message?.react(this.newConfig.newBanMessageEmoji);
            else
                for (let emoji of currentNewVote.newVoteObjects[i].emojis)
                    await currentNewVote.newVoteObjects[i].message?.react(emoji);
        }

        msg = await channel.send({
            embeds: [this.newEmbeds.readyForm(currentNewVote)],
            components: this.newButtons.newPlayersRow()
        });
        collector = msg.createReactionCollector({time: this.newConfig.votingTime});
        currentNewVote.newVoteObjects[currentNewVote.newVoteObjects.length - 1].init(msg, collector);
        collector.on("collect", async (reaction: MessageReaction, user: User) => {await collectorNew(reaction, user)});
        for (let user of currentNewVote.users)
            if (user != currentNewVote.interaction.user)
                await user.send({embeds: this.botlibEmbeds.notify(`⚡ Началось голосование для новой игры в режиме **__${currentNewVote.type}__**. На голосование можно перейти по ссылке ниже.
                https://discordapp.com/channels/${currentNewVote.guildID}/${currentNewVote.newVoteObjects[0].message?.channel.id}/${currentNewVote.newVoteObjects[0].message?.id}`)});
    }

    async resolve(currentNewVote: NewVote){
        if(!currentNewVote.isProcessing)
            return;
        currentNewVote.isProcessing = false;
        await currentNewVote.resolve();
        await currentNewVote.interaction.channel?.send({embeds: [this.newEmbeds.resolveForm(currentNewVote)]});
        if(currentNewVote.type == "Teamers")
            await this.adapterNewSplit.getSplit(currentNewVote);
        else
            await this.adapterNewDraft.getDraftFromNew(currentNewVote);
        for(let i: number = currentNewVote.newVoteObjects.length-1; i >= 0; i--)
            await currentNewVote.newVoteObjects[i].destroy();
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
    let currentVote: NewVote | undefined = NewService.Instance.newVoteArray.filter(x => x.isProcessing && (x.interaction.guild?.id == msg.guild?.id))[0];
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
