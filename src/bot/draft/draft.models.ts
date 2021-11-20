import {CommandInteraction, GuildChannel, GuildMember, User} from "discord.js";

export class DraftEmbedObject {
    type: "ffa" | "teamers" | "blind" | undefined;
    isProcessing: boolean = false;

    interaction: CommandInteraction;
    amount: number = 0;
    rawBans: string[] = [];

    bans: string[] = [];
    errors: string[] = [];
    civilizations: string[] = [];
    draft: string[][] = [];

    botsCount: number = 0;

    users: User[] = [];
    usersReadyBlind: boolean[] = [];

    redraftCounter: number = 0;
    redraftMinAmount: number = 0;
    redraftStatus: number[] = [];   // -1, 0, 1
    redraftResult: number = -1; // -1, 0, 1

    constructor(interaction: CommandInteraction, amount: number, strBans: string){
        this.interaction = interaction;
        this.amount = amount;
        this.rawBans = strBans
            .toLowerCase()
            .replaceAll(">", "> ")
            .split(/(?:\n| )+/);

        let member = interaction.member as GuildMember;
        let channel = member.voice.channel as GuildChannel;
        if(channel != null){
            this.users = Array.from(channel.members.values()).map((member): User => {return member.user});
            for(let i = 0; i < this.users.length; i++){
                if(this.users[i].bot){
                    this.botsCount++;
                    this.users.splice(i, 1);
                    i--;
                }
            }
        }
    }
}
