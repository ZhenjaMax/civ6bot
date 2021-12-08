import {User} from "discord.js";

export class NewVote{
    users: User[] = [];
    options: string[] = [];
    status: boolean[][] = [];   //options, users
    result: number = -1;

    constructor(users: User[], options: string[]) {
        this.users = users;
        this.options = options;
        for(let i in options)
            for(let j in users)
                this.status.push(new Array(this.users.length).fill(false));
    }
}

export class NewEmbedObject{
    isProcessing: boolean = false;
    votes: NewVote[] = [];

}
