import {CommandInteraction, GuildChannel, GuildMember, MessageEmbed, User} from "discord.js";
import {NewConfig} from "./new.config";

export class NewVote{
    type: "ffa" | "teamers";
    users: User[] = [];
    newVoteObjects: NewVoteObject[] = [];
    isProcessing: boolean = false;

    messages: MessageEmbed[] = [];
    interaction: CommandInteraction;
    guildID: string;

    constructor(interaction: CommandInteraction, type: "ffa" | "teamers") {
        this.interaction = interaction;
        this.guildID = interaction.guildId;
        this.type = type;

        let member = interaction.member as GuildMember;
        let channel = member.voice.channel as GuildChannel;
        if(channel != null)
            this.users = Array.from(channel.members.values()).map((member): User => {return member.user});

        let newConfig: NewConfig = new NewConfig();
        let header: string = "";
        let options: string[][] = (type == "ffa") ? newConfig.newOptionsFFA : newConfig.newOptionsTeamers;

        for(let i in options) {
            header = options[i].shift() as string;
            this.newVoteObjects.push(new NewVoteObject(header, options[i]));
        }
    }

    resolveAll(): void{ this.newVoteObjects.forEach(x => x.resolve()); }
}

export class NewVoteObject{
    header: string;
    options: string[];
    votes: number[][] = [];
    result: number = -1;

    constructor(header: string, options: string[]){
        this.header = header;
        this.options = options;
        this.votes = Array(options.length).fill([]);
    }

    updateVote(userIndex: number, optionIndex: number): void{
        let currentUserIndex: number = this.votes[optionIndex].indexOf(userIndex);
        if(currentUserIndex == -1)
            this.votes[optionIndex].push(userIndex);
        else
            this.votes[optionIndex].splice(currentUserIndex, 1);
    }

    resolve(): void{
        let votesCount: number[] = [];
        for(let i in this.votes)
            votesCount.push(this.votes[i].length)
        let votesMax: number = Math.max(...votesCount)
        let candidates: number[] = [];
        for(let i = 0; i < votesCount.length; i++)
            if(votesCount[i] == votesMax)
                candidates.push(i);
        this.result = candidates[Math.floor(Math.random()*candidates.length)];
    }
}

