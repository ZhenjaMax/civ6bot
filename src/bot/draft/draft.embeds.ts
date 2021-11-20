import {MessageEmbed, User} from "discord.js";
import {DraftEmbedObject} from "./draft.models";
import {BotlibRandom} from "../../botlib/botlib.random";
import {DraftConfig} from "./draft.config";
import {BotlibEmojies} from "../../botlib/botlib.emojies";

export class DraftEmbeds{
    botlibEmojies: BotlibEmojies = new BotlibEmojies();

    protected baseDraftEmbed(draftEmbedObject: DraftEmbedObject): MessageEmbed{
        let bansString: string = "";
        if(draftEmbedObject.bans.length != 0){
            bansString += `⛔ **Список банов (${draftEmbedObject.bans.length}):**\n`;
            for(let ban of draftEmbedObject.bans)
                bansString += (ban + "\n");
            bansString += "\u200B";
        }
        let errorsString: string = "";
        if(draftEmbedObject.errors.length != 0){
            errorsString += `⚠️ **Список ошибок (${draftEmbedObject.errors.length}):**\n`;
            for(let error of draftEmbedObject.errors)
                errorsString += (error + ", ");
            errorsString = errorsString.slice(0, -2) + "\n";
        }
        let botsString: string = "";
        if(draftEmbedObject.type != "teamers"){
            if(draftEmbedObject.botsCount != 0){
                botsString += `🤖 **В канале присутству${
                    draftEmbedObject.botsCount == 1 ? "ет" : "ют"
                } ${draftEmbedObject.botsCount} бот${
                    draftEmbedObject.botsCount == 1 ? "" : "а"
                }.**\nБоты были удалены из драфта.`
            }
        }
        let blindNoSwapString: string = "";
        if(draftEmbedObject.type == "blind")
            blindNoSwapString += "\n❗ **Свап цивилизациями запрещён при драфте вслепую.**";
        return new MessageEmbed()
            .setColor(BotlibRandom.getRandomHexBrightString())
            .setDescription(bansString+errorsString+botsString+blindNoSwapString);
    }

    draftFFA(draftEmbedObject: DraftEmbedObject): MessageEmbed{
        let headerString: string =
            (draftEmbedObject.redraftCounter == 0 ? "Драфт FFA" : `Редрафт #${draftEmbedObject.redraftCounter}`)
            + ` для ${draftEmbedObject.users.length} игрок`
            + (draftEmbedObject.users.length == 1 ? "а" : "ов");
        let embedMsg = this.baseDraftEmbed(draftEmbedObject)
            .setAuthor(headerString);
        for(let i = 0; i < draftEmbedObject.users.length; i++){
            let fieldString: string = `**${
                draftEmbedObject.users[i].tag
            }** (<@${
                draftEmbedObject.users[i].id
            }>)`;
            for(let j = 0; j < draftEmbedObject.amount; j++)
                fieldString += `\n${draftEmbedObject.draft[i][j]}`;
            embedMsg.addField("\u200b", fieldString);
        }
        return embedMsg;
    }

    draftTeamers(draftEmbedObject: DraftEmbedObject): MessageEmbed[]{
        let headerString = ((draftEmbedObject.redraftCounter == 0) ? "Драфт" : "Редрафт")
            + ` Teamers для ${draftEmbedObject.amount} команд`;
        let embedMsgArray: MessageEmbed[] = [];
        let hexColor = BotlibRandom.getRandomHexBrightString();
        embedMsgArray.push(this.baseDraftEmbed(draftEmbedObject)
            .setColor(hexColor)
            .setAuthor(headerString));
        for(let i = 0; i < draftEmbedObject.amount; i++){
            let teamersDraftString = `**Команда #${i+1}**`;
            for(let j in draftEmbedObject.draft[i])
                teamersDraftString += `\n${draftEmbedObject.draft[i][j]}`;
            let embedMsg: MessageEmbed = new MessageEmbed()
                .setColor(hexColor)
                .setDescription(teamersDraftString)
                .setThumbnail(DraftConfig.teamersThumbnailsURL[i]);
            embedMsgArray.push(embedMsg);
        }
        return embedMsgArray;
    }

    draftBlindPm(draftEmbedObject: DraftEmbedObject, userNumber: number): MessageEmbed{
        let fieldString: string = "";
        for(let i: number = 0; i < draftEmbedObject.draft[userNumber].length; i++)
            fieldString += `${draftEmbedObject.draft[userNumber][i]}\n`;
        return new MessageEmbed()
            .setAuthor("Выбор цивилизации для драфта вслепую")
            .setDescription("Вам предлагается тайно выбрать одну из цивилизаций, перечисленных ниже.\n❗ **Свап цивилизациями запрещён при драфте вслепую.**")
            .addField("🤔 Примите решение.", fieldString)
            .setColor("#FFFFFF");
    }

    draftBlindPmReady(draftEmbedObject: DraftEmbedObject, userNumber: number): MessageEmbed{
        return new MessageEmbed()
            .setAuthor("Выбор цивилизации для драфта вслепую")
            .setDescription("❗ **Свап цивилизациями запрещён при драфте вслепую.**")
            .addField("🗿 Решение принято.", draftEmbedObject.draft[userNumber][0])
            .setColor("#FFFFFF");
    }

    draftBlindProcessing(draftEmbedObject: DraftEmbedObject): MessageEmbed{
        if((draftEmbedObject.usersReadyBlind.filter(x => x)).length == draftEmbedObject.users.length)
            return this.draftBlind(draftEmbedObject);
        let headerString: string =
            ((draftEmbedObject.redraftCounter == 0) ? "Драфт" : `Редрафт #${draftEmbedObject.redraftCounter}`)
            + " вслепую"
            + ` для ${draftEmbedObject.users.length} игрок`
            + (draftEmbedObject.users.length == 1 ? "а" : "ов");
        let usersString: string = "";
        let readyString: string = "";
        for(let i: number = 0; i < draftEmbedObject.users.length; i++){
            usersString += `${draftEmbedObject.users[i]}\n`;
            readyString += `${draftEmbedObject.usersReadyBlind[i] ? this.botlibEmojies.yes : this.botlibEmojies.no}\n`
        }
        return new MessageEmbed()
            .setAuthor(headerString)
            .setColor("#FFFFFF")
            .setDescription("Игроки выбирают цивилизации. Пожалуйста, подождите.")
            .addField("**Игрок:**", usersString, true)
            .addField("**Готов?**", readyString, true);
    }

    draftBlind(draftEmbedObject: DraftEmbedObject): MessageEmbed{
        let headerString: string =
            ((draftEmbedObject.redraftCounter == 0) ? "Драфт" : `Редрафт #${draftEmbedObject.redraftCounter}`)
            + " вслепую"
            + ` для ${draftEmbedObject.users.length} игрок`
            + (draftEmbedObject.users.length == 1 ? "а" : "ов");
        let embedMsg: MessageEmbed = this.baseDraftEmbed(draftEmbedObject)
            .setAuthor(headerString);
        let usersString: string = "";
        let civilizationsString: string = "";
        for(let i = 0; i < draftEmbedObject.users.length; i++) {
            usersString += `${draftEmbedObject.users[i]}\n`;
            civilizationsString += `${draftEmbedObject.draft[i][0].slice(draftEmbedObject.draft[i][0].indexOf(" ")+1)}\n`
        }
        let authorUser: User = draftEmbedObject.interaction.user as User;
        return embedMsg
            .addField("**Игрок:**", usersString, true)
            .addField("**Лидер:**", civilizationsString, true)
            .setFooter(authorUser.tag, authorUser.avatarURL() || undefined);
    }

    redraftProcessing(draftEmbedObject: DraftEmbedObject): MessageEmbed{
        let descriptionString = "";
        let embedMsg: MessageEmbed = new MessageEmbed();
        switch(draftEmbedObject.redraftResult){
            case -1:
                descriptionString += `Предлагается провести редрафт.\nДля успешного редрафта необходимо **${draftEmbedObject.redraftMinAmount}/${draftEmbedObject.users.length} голосов** ${this.botlibEmojies.yes} **\"за\".**\n\n⏰ **На голосование отводится 90 секунд!**`;
                break;
            case 0:
                descriptionString = `${this.botlibEmojies.no} **Редрафт отклонён.**`;
                break;
            case 1:
                descriptionString = `${this.botlibEmojies.yes} **Редрафт принят.**`;
                break;
        }
        let authorUser: User = draftEmbedObject.interaction.user as User;
        let titleString: string = `🔄 Редрафт #${draftEmbedObject.redraftCounter+1} ${draftEmbedObject.type == "ffa" ? "FFA" : (draftEmbedObject.type == "teamers" ? "Teamers" : "вслепую" )}`;
        embedMsg
            .setTitle(titleString)
            .setColor("#b0b0b0")
            .setFooter(authorUser.tag, authorUser.avatarURL() || undefined)
            .setDescription(descriptionString)
            .addField(`${this.botlibEmojies.yes} **За**`, `${draftEmbedObject.redraftStatus.filter(x => (x==1)).length}`, true)
            .addField(`${this.botlibEmojies.no} **Против**`, `${draftEmbedObject.redraftStatus.filter(x => (x==0)).length}`, true);
        return embedMsg;
    }
}
