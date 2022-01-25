import {CommandInteraction, GuildChannel, GuildMember, Message, MessageReaction, ReactionCollector, User} from "discord.js";
import {BotlibEmojis} from "../../botlib/botlib.emojis";
import {SplitConfig} from "./split.config";
import {NewVote} from "../new/new.models";

export class SplitObject{
    interaction: CommandInteraction;
    guildID: string;
    isProcessing: boolean = true;

    message: Message | undefined;
    reactions: MessageReaction[] = [];
    messageEmojisCollector: ReactionCollector | undefined;

    captains: User[];
    users: User[] = [];

    emojis: string[] = [];
    options: string[] = [];
    pickOrder: number [] = [];

    step: number = 1;
    stepTotal: number = 0;
    commands: string[][] = [];

    newVote: NewVote | undefined;

    constructor(interaction: CommandInteraction, captains: User[], usersFromNew: User[] = []) {
        this.interaction = interaction;
        this.guildID = interaction.guildId;
        this.captains = captains;
        if(Math.random() >= 0.5)
            this.captains.reverse();
        for(let i: number = 0; i < this.captains.length; i++)
            this.commands.push([`👑 ${this.captains[i].toString()}`]);

        if(usersFromNew.length == 0){
            let member = interaction.member as GuildMember;
            let channel = member.voice.channel as GuildChannel;
            if(channel == null)
                return;
            this.users = Array.from(channel.members.values()).map((member): User => {return member.user});
            for (let i in this.captains)
                if (this.users.indexOf(this.captains[i]) == -1) {
                    this.captains = [];
                    return;
                }
            for (let i = 0; i < this.users.length; i++) {
                if (this.users[i].bot || (this.captains.indexOf(this.users[i]) != -1)) {
                    this.users.splice(i, 1);
                    i--;
                }
            }
        } else
            this.users = usersFromNew;

        this.stepTotal = this.users.length-1;
        let botlibEmojis: BotlibEmojis = new BotlibEmojis();
        let splitConfig: SplitConfig = new SplitConfig();
        this.emojis = botlibEmojis.letters.slice(0, this.users.length);
        this.pickOrder = splitConfig.pickOrder;
        this.loadOptions();
    }

    init(msg: Message, collector: ReactionCollector){
        this.message = msg;
        this.messageEmojisCollector = collector;
    }

    initNew(newVote: NewVote){this.newVote = newVote;}

    updateOptions(index: number){
        this.commands[this.pickOrder.shift() as number].push(this.users.splice(index, 1)[0].toString());
        this.options = [];
        this.emojis.splice(this.emojis.length-1, 1);
        this.loadOptions();
        this.step++;
    }

    loadOptions(){
        this.options = [];
        for(let i in this.users)
            this.options.push(`${this.emojis[i]} ${this.users[i].toString()}`);
    }

    random(){
        while(this.users.length >= this.captains.length)
            for(let i in this.commands)
                this.commands[i].push(this.users.splice(Math.floor(Math.random()*this.users.length), 1)[0].toString());
    }
}
