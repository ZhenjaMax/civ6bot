import {MessageEmbed} from "discord.js";
import {NewVote} from "./new.models";

export class NewEmbeds{
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
        if(fieldValueNotReady == "")
            fieldValueNotReady = "—";
        embedMsg.addField("Не готов", fieldValueNotReady, true);
        embedMsg.addField("Готов", fieldValueReady, true);
        return embedMsg;
    }

    resolveForm(newVote: NewVote): MessageEmbed{
        return new MessageEmbed()
            .setColor("#888888")
            .setTitle(`Голосование для новой игры в режиме ${newVote.type}`)
            .setDescription(newVote.getContent());
    }
}
