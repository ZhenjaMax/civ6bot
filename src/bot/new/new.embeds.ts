import {MessageEmbed} from "discord.js";
import {NewVote, NewVoteObject} from "./new.models";

export class NewEmbeds{
    voteForm(newVote: NewVote, index: number): MessageEmbed{
        let currectNewVoteObject: NewVoteObject = newVote.newVoteObjects[index];
        let embedMsg: MessageEmbed = new MessageEmbed()
            .setAuthor(currectNewVoteObject.header)
            .setColor("#888888");
        if(currectNewVoteObject.result != -1)
            embedMsg.setDescription(`**Результат: ${currectNewVoteObject.options[currectNewVoteObject.result]}**`);
        let fieldValue: string = "";
        for(let i in currectNewVoteObject.options){
            fieldValue += `${currectNewVoteObject.votes.length}`;
            for(let j in currectNewVoteObject.votes[i])
                fieldValue += `\n${newVote.users[currectNewVoteObject.votes[i][j]].toString()}`;
            embedMsg.addField(currectNewVoteObject.options[i], fieldValue);
        }
        return embedMsg;
    }
}
