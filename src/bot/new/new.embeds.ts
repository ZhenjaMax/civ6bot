import {MessageEmbed} from "discord.js";
import {NewVote, NewVoteObject} from "./new.models";

export class NewEmbeds{
    voteForm(newVote: NewVote, index: number): MessageEmbed{
        let currentNewVoteObject: NewVoteObject = newVote.newVoteObjects[index];
        let embedMsg: MessageEmbed = new MessageEmbed()
            .setTitle(currentNewVoteObject.header)
            .setColor("#888888")
            .setAuthor(`Голосование для новой игры в режиме ${newVote.type}`);
        if(currentNewVoteObject.result != -1) {
            embedMsg.setDescription(`**Результат: ${currentNewVoteObject.options[currentNewVoteObject.result]}**`);
            return embedMsg;
        }
        let fieldValue: string;
        for(let i in currentNewVoteObject.options){
            fieldValue = `${currentNewVoteObject.votes[i].length}`;
            for(let j in currentNewVoteObject.votes[i])
                fieldValue += `\n${newVote.users[currentNewVoteObject.votes[i][j]].toString()}`;
            embedMsg.addField(currentNewVoteObject.options[i], fieldValue, true);
        }
        return embedMsg;
    }

    readyForm(newVote: NewVote): MessageEmbed{
        let embedMsg: MessageEmbed = new MessageEmbed()
            .setTitle("⚡ Вы готовы?")
            .setColor("#888888")
            .setAuthor(`Голосование для новой игры в режиме ${newVote.type}`);
        let fieldValueNotReady: string = "";
        let fieldValueReady: string = "";
        for(let i in newVote.ready)
            if(newVote.ready[i] == 0)
                fieldValueNotReady += `${newVote.users[i].toString()}\n`
            else
                fieldValueReady += `${newVote.users[i].toString()}\n`
        if(fieldValueReady == "")
            fieldValueReady = "—";
        embedMsg.addField("Не готов", fieldValueNotReady, true);
        embedMsg.addField("Готов", fieldValueReady, true);
        return embedMsg;
    }
}
