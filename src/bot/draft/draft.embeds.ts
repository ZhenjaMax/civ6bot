import {MessageEmbed, User} from "discord.js";
import {DraftEmbedObject} from "./draft.models";
import {BotlibRandom} from "../../botlib/botlib.random";
import {DraftConfig} from "./draft.config";
import {BotlibEmojis} from "../../botlib/botlib.emojis";

export class DraftEmbeds{
    botlibEmojis: BotlibEmojis = new BotlibEmojis();
    draftConfig: DraftConfig = new DraftConfig();

    protected getBaseDescriptionString(draftEmbedObject: DraftEmbedObject): string{
        let bansString: string = "";
        let errorsString: string = "";
        let botsString: string = "";
        let blindNoSwapString: string = "";
        let blindProcessing: string = "";

        if(draftEmbedObject.bans.length != 0){
            bansString += `⛔ **Список банов (${draftEmbedObject.bans.length}):**\n`;
            for(let ban of draftEmbedObject.bans)
                bansString += (ban + "\n");
            bansString += "\u200B";
        }
        if(draftEmbedObject.errors.length != 0){
            errorsString += `⚠️ **Список ошибок (${draftEmbedObject.errors.length}):**\n`;
            for(let error of draftEmbedObject.errors)
                errorsString += (error + ", ");
            errorsString = errorsString.slice(0, -2) + "\n";
        }
        if(draftEmbedObject.type != "teamers"){
            if(draftEmbedObject.botsCount != 0){
                botsString += `🤖 **В канале присутству${
                    draftEmbedObject.botsCount == 1 ? "ет" : "ют"
                } ${draftEmbedObject.botsCount} бот${
                    draftEmbedObject.botsCount == 1 ? "" : "а"
                }.**\nБоты были удалены из драфта.`
            }
        }
        if(draftEmbedObject.type == "blind") {
            blindNoSwapString += "\n❗ **Свап цивилизациями запрещён при драфте вслепую.**";
            if(draftEmbedObject.isProcessing)
                blindProcessing += "\nИгроки выбирают цивилизации. Пожалуйста, подождите.";
        }

        return bansString+errorsString+botsString+blindNoSwapString+blindProcessing;
    }

    protected baseDraftEmbed(draftEmbedObject: DraftEmbedObject): MessageEmbed{
        return new MessageEmbed()
            .setColor(BotlibRandom.getRandomHexBrightString())
            .setDescription(this.getBaseDescriptionString(draftEmbedObject));
    }

    draftFFA(draftEmbedObject: DraftEmbedObject): MessageEmbed{
        let headerString: string =
            (draftEmbedObject.redraftCounter == 0 ? "Драфт FFA" : `Редрафт #${draftEmbedObject.redraftCounter}`)
            + ` для ${draftEmbedObject.users.length} игрок`
            + (draftEmbedObject.users.length == 1 ? "а" : "ов");
        let embedMsg = this.baseDraftEmbed(draftEmbedObject)
            .setAuthor(headerString);

        for(let i = 0; i < draftEmbedObject.users.length; i++){
            let fieldString: string = `**${draftEmbedObject.users[i].tag}** (<@${draftEmbedObject.users[i].id}>)`;
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
                .setThumbnail(this.draftConfig.teamersThumbnailsURL[i]);
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
            .setDescription("\n❗ **Свап цивилизациями запрещён при драфте вслепую.**")
            .addField(
                "🤔 **Статус: в процессе выбора.**",
                "Вам предлагается тайно выбрать одну из цивилизаций, перечисленных ниже. Для этого нажмите на одну из кнопок ниже.\n**Учтите, что вы не сможете перевыбрать. Будьте внимательны!**\n\n" + fieldString)
            .setColor("#FFFFFF");
    }

    draftBlindPmReady(draftEmbedObject: DraftEmbedObject, userNumber: number): MessageEmbed{
        return new MessageEmbed()
            .setAuthor("Выбор цивилизации для драфта вслепую")
            .setDescription("❗ **Свап цивилизациями запрещён при драфте вслепую.**")
            .addField("🗿 **Статус: решение принято.**", "Теперь возвращайтесь в исходный текстовый канал и ожидайте результата.\n\nВы выбрали — " + draftEmbedObject.draft[userNumber][0])
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
            readyString += `${draftEmbedObject.usersReadyBlind[i] ? this.botlibEmojis.yes : this.botlibEmojis.no}\n`
        }
        return this.baseDraftEmbed(draftEmbedObject)
            .setAuthor(headerString)
            .setColor("#FFFFFF")
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
                descriptionString += `Предлагается провести редрафт.\nДля успешного редрафта необходимо **${draftEmbedObject.redraftMinAmount}/${draftEmbedObject.users.length} голосов** ${this.botlibEmojis.yes} **\"за\".**\n\n⏰ **На голосование отводится 90 секунд!**`;
                break;
            case 0:
                descriptionString = `${this.botlibEmojis.no} **Редрафт отклонён.**`;
                break;
            case 1:
                descriptionString = `${this.botlibEmojis.yes} **Редрафт принят.**`;
                break;
        }
        let authorUser: User = draftEmbedObject.interaction.user as User;
        let titleString: string = `🔄 Редрафт #${draftEmbedObject.redraftCounter+1} ${draftEmbedObject.type == "ffa" ? "FFA" : (draftEmbedObject.type == "teamers" ? "Teamers" : "вслепую" )}`;

        let yesRedraft: string = "", noRedraft: string = "", abstainedRedraft = "";
        for(let i in draftEmbedObject.redraftStatus)
            switch (draftEmbedObject.redraftStatus[i]) {
                case -1:
                    abstainedRedraft += `${draftEmbedObject.users[i].toString()}\n`
                    break;
                case 0:
                    noRedraft += `${draftEmbedObject.users[i].toString()}\n`
                    break;
                case 1:
                    yesRedraft += `${draftEmbedObject.users[i].toString()}\n`
                    break;
            }
        embedMsg
            .setTitle(titleString)
            .setColor("#b0b0b0")
            .setFooter(authorUser.tag, authorUser.avatarURL() || undefined)
            .setDescription(descriptionString)
            .addField(`${this.botlibEmojis.yes} **За**`, `**${draftEmbedObject.redraftStatus.filter(x => (x==1)).length}**\n${yesRedraft}`, true)
            .addField(`🤔 **Не проголосовали**`, `**${draftEmbedObject.redraftStatus.filter(x => (x==-1)).length}**\n${abstainedRedraft}`, true)
            .addField(`${this.botlibEmojis.no} **Против**`, `**${draftEmbedObject.redraftStatus.filter(x => (x==0)).length}**\n${noRedraft}`, true);
        return embedMsg;
    }
}
