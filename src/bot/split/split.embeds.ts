import {MessageEmbed} from "discord.js";
import {SplitObject} from "./split.models";

export class SplitEmbeds{
    splitProcessing(splitObject: SplitObject): MessageEmbed{
        let msg: MessageEmbed = new MessageEmbed()
            .setColor("#35f00f")
            .setTitle(`🐲 Разделение на команды (шаг ${splitObject.step}/${splitObject.stepTotal})`)
            .addField("Доступные игроки", splitObject.options.join("\n"), true);
        for(let i in splitObject.commands)
            msg.addField(`Команда #${Number(i)+1}`, splitObject.commands[i].join("\n"), true);
        msg.setDescription(
            (splitObject.step == 1)
            ? `🍀 Фортуна решила, что первым будет выбирать ${splitObject.captains[splitObject.pickOrder[0]].toString()}!\nВыбирает капитан команды **#${splitObject.pickOrder[0]+1}**.`
            : `Теперь выбирает капитан команды **#${splitObject.pickOrder[0]+1} (${splitObject.captains[splitObject.pickOrder[0]].toString()})**.`
        );
        return msg;
    }

    splitResult(splitObject: SplitObject, random: boolean = false): MessageEmbed{
        let msg: MessageEmbed = new MessageEmbed()
            .setColor("#35f00f")
            .setTitle(`🐲 Разделение на команды ${random ? "(случайное)" : ""}`)
            .setDescription("Разделение на команды завершено!");
        if(splitObject.users.length != 0)
            msg.addField("Не выбран", splitObject.users[0].toString(), true);
        for(let i in splitObject.commands)
            msg.addField(`Команда #${Number(i)+1}`, splitObject.commands[i].join("\n"), true);
        return msg;
    }
}
