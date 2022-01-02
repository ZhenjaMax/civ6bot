import {CommandInteraction, GuildChannel, GuildMember, Message, MessageReaction, ReactionCollector, User} from "discord.js";
import {DraftConfig} from "../draft/draft.config";
import {NewEmbeds} from "./new.embeds";
import {AdapterNew} from "../adapters/adapter.new";
import {NewConfig} from "./new.config";

export class NewVote{
    type: "FFA" | "Teamers";
    interaction: CommandInteraction;
    guildID: string;
    isProcessing: boolean = true;
    date: Date = new Date();

    newVoteObjects: NewVoteObjectBase[] = [];
    users: User[] = [];

    draftTypeFFA: "Classic" | "Blind" | undefined;
    gameTypeTeamers: "Classic" | "CWC" | undefined;
    captains: number[] = [];
    bans: string = "";
    ready: number[] = [];
    botsCount: number = 0;

    constructor(interaction: CommandInteraction, type: "FFA" | "Teamers") {
        this.type = type;
        this.interaction = interaction;
        this.guildID = interaction.guildId;

        let member = interaction.member as GuildMember;
        let channel = member.voice.channel as GuildChannel;
        if(channel == null)
            return;
        this.botsCount = Array.from(channel.members.values()).map((member): User => {return member.user}).filter(x => { return x.bot; }).length;
        this.users = Array.from(channel.members.values()).map((member): User => {return member.user}).filter(x => { return !x.bot; });
        this.ready = new Array<number>(this.users.length).fill(0);
    }

    async destroy(){
        this.isProcessing = false;
        for(let i in this.newVoteObjects)
            this.newVoteObjects[i].emojis = [];
        for(let i: number = this.newVoteObjects.length-1; i >= 0; i--)
            await this.newVoteObjects[i].destroy();
    }

    private async getValues() {
        for(let i: number = 0; i < this.newVoteObjects.length; i++)
            await this.newVoteObjects[i].resolve();
        let commonObject: NewVoteObjectCommon, captainObject: NewVoteObjectCaptains, draftObject: NewVoteObjectDraft;
        if(this.type == "FFA"){
            commonObject = this.newVoteObjects[this.newVoteObjects.length-3] as NewVoteObjectCommon;
            this.draftTypeFFA = (commonObject.result == 0) ? "Classic" : "Blind";
        } else {
            commonObject = this.newVoteObjects[this.newVoteObjects.length-4] as NewVoteObjectCommon;
            captainObject = this.newVoteObjects[this.newVoteObjects.length-3] as NewVoteObjectCaptains;
            this.gameTypeTeamers = (commonObject.result == 0) ? "Classic" : "CWC";
            this.captains = captainObject.resultCaptains;
        }
        draftObject = this.newVoteObjects[this.newVoteObjects.length-2] as NewVoteObjectDraft;
        this.bans = draftObject.resultBansString;
    }

    async resolve(){
        this.isProcessing = false;
        await this.getValues();

        let newEmbeds: NewEmbeds = new NewEmbeds();
        await this.newVoteObjects[this.newVoteObjects.length-1].message?.edit({
            embeds: [newEmbeds.resolveForm(this)],
            components: []
        });
        let adapterNew: AdapterNew = new AdapterNew();
        await adapterNew.getDraftFromNew(this);

        for(let i: number = this.newVoteObjects.length-2; i >= 0; i--)
            await this.newVoteObjects[i].destroy();
    }

    getContent(): string{
        let content = "";
        switch(this.type){
            case "FFA":
                for(let i: number = 0; i < this.newVoteObjects.length; i++) {
                    content += `\n${this.newVoteObjects[i].getContent()}`;
                    if(i == 5 || i == 10)
                        content += "\n";
                }
                break;
            case "Teamers":
                for(let i: number = 0; i < this.newVoteObjects.length; i++) {
                    content += `\n${this.newVoteObjects[i].getContent()}`;
                    if(i == 2)
                        content += "\n";
                }
                break;
        }
        return content;
    }
}

export abstract class NewVoteObjectBase{
    header: string;
    options: string[];
    emojis: string[];

    message: Message | undefined;
    messageEmojisCollector: ReactionCollector | undefined;

    init(msg: Message, msgCollector: ReactionCollector){
        this.message = msg;
        this.messageEmojisCollector = msgCollector;
    }

    async destroy(){
        try {
            await this.messageEmojisCollector?.stop();
            await this.message?.delete();
            this.message = undefined;
        } catch(destroyError){
            return;
        }
    }

    protected constructor(header: string, options: string[], emojis: string[]){
        this.header = header;
        this.options = options;
        this.emojis = emojis;
    }

    protected getVotesCount(): number[]{
        if(!this.message)
            return [];
        let results = Array.from(this.message?.reactions.cache);
        return this.emojis.map(emojiNew => {
            let resultsObject: [string, MessageReaction] | undefined = results.filter(x => x[1].emoji.toString().toLowerCase() == emojiNew)[0];
            if(!resultsObject)
                return 0;
            return resultsObject[1].count;
        });
    }

    abstract getContent(): string;
    abstract resolve(): void;
}

export class NewVoteObjectCommon extends NewVoteObjectBase{
    result: number = -1;

    constructor(header: string, options: string[], emojis: string[]) { super(header, options, emojis); }

    getContent(): string {
        let content: string = `${this.header} `;
        if(this.result == -1)
            for(let i in this.options)
                content += `| ${this.options[i]} `;
        else
            content += `| ${this.options[this.result]}`;
        return content;
    }

    resolve(): void {
        this.messageEmojisCollector?.stop();
        let votesCount: number[] = this.getVotesCount();
        let votesMax: number = Math.max(...votesCount);
        let candidates: number[] = [];
        for(let i = 0; i < votesCount.length; i++)
            if(votesCount[i] == votesMax)
                candidates.push(i);
        this.result = candidates[Math.floor(Math.random()*candidates.length)];
    }
}

export class NewVoteObjectCaptains extends NewVoteObjectBase{
    resultCaptains: number[] = [];

    constructor(header: string, users: User[]) {
        super(header, [], []);
        let newConfig: NewConfig = new NewConfig();
        this.emojis = newConfig.captainEmojis.slice(0, users.length);
        for(let i: number = 0; i < users.length; i++)
            this.options.push(`${this.emojis[i]} ${users[i].toString()}`);
    }

    getContent(): string {
        let content: string = `${this.header} `;
        if(this.resultCaptains.length == 0)
            for (let i in this.options)
                content += `| ${this.options[i]} `;
        else
            content += `| ${this.options[this.resultCaptains[0]]} и ${this.options[this.resultCaptains[1]]}`;
        return content;
    }

    async resolve() {
        await this.messageEmojisCollector?.stop();
        let votesCount: number[] = this.getVotesCount();
        for(let i: number = 0; i < 2; i++){
            let votesMax: number = Math.max(...votesCount);
            let candidates: number[] = [];
            for(let i = 0; i < votesCount.length; i++)
                if(votesCount[i] == votesMax)
                    candidates.push(i);
            let captain: number = candidates[Math.floor(Math.random()*candidates.length)];
            this.resultCaptains.push(captain);
            votesCount[captain] = -1;
        }
    }
}

export class NewVoteObjectDraft extends NewVoteObjectBase{
    usersForBanMin: number;
    civilizations: Map<string, string>;

    resultBans: string[] = [];
    resultBansString: string = "";

    constructor(header: string, usersCount: number) {
        super(header, [], []);
        let draftConfig: DraftConfig = new DraftConfig();
        this.usersForBanMin = Math.floor((usersCount+1)/2);
        this.civilizations = draftConfig.civilizations;
        this.emojis = Array.from(this.civilizations.keys());
        this.options = Array.from(this.civilizations.values());
    }

    getContent(): string {
        let content: string = `**🤔 Баны цивилизаций ${(this.resultBans.length == 0) ? "(нет)" : `(${this.resultBans.length}):`}**`;
        for (let i in this.resultBans)
            content += `\n${this.civilizations.get(this.resultBans[i])}`;
        return content;
    }

    resolve() {
        for(let ban of this.resultBans)
            this.resultBansString += ban;
    }

    async resolveProcessing(reaction: MessageReaction): Promise<boolean> {
        let emojiIndex: number = this.emojis.indexOf(reaction.emoji.toString().toLowerCase());
        if(emojiIndex == -1)
            return false;
        let votes: number[] = this.getVotesCount();
        if(votes[emojiIndex] < this.usersForBanMin)
            return false;
        this.resultBans.push(this.emojis.splice(emojiIndex, 1)[0]);
        await reaction.remove();
        return true;
    }

    getContentProcessing(): string{
        let content: string = `${this.header} `;
        for(let i in this.resultBans)
            content += `\n${this.civilizations.get(this.resultBans[i])}`;
        return content;
    }
}

export class NewVoteObjectBlank extends NewVoteObjectBase{
    constructor(header: string){super(header, [], []);}
    getContent(): string{ return this.header; }
    resolve(){}
}
