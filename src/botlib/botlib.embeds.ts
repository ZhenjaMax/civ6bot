import {MessageEmbed} from "discord.js";

export function SignEmbed(target: Object, method: string, descriptor: PropertyDescriptor){
    let originalMethod = descriptor.value;
    descriptor.value = function(...args: any[]){
        let returnValue: MessageEmbed | MessageEmbed[] = originalMethod.apply(this, args);
        if(Array.isArray(returnValue))
            returnValue[returnValue.length-1].setFooter(args[0].user.tag, args[0].user.avatarURL() || undefined);
        else
            returnValue.setFooter(args[0].user.tag, args[0].user.avatarURL() || undefined);
        return returnValue;
    }
}

export class BotlibEmbeds{
    error(errorDescription: string = "Неизвестная ошибка!"): MessageEmbed{
        return new MessageEmbed()
            .setColor("#FF0000")
            .addField("Ошибка!", errorDescription);
    }

    notify(notifyDescription: string): MessageEmbed{
        return new MessageEmbed()
            .setColor("#66FF66")
            .addField("Уведомление", notifyDescription);
    }
}
