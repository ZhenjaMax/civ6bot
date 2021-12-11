import {CommandInteraction, Message, MessageEmbed} from "discord.js";
import {DraftEmbedObject} from "./draft.models"
import {BotlibEmbeds, SignEmbed} from "../../botlib/botlib.embeds";
import {DraftEmbeds} from "./draft.embeds";
import {DraftConfig} from "./draft.config";
import {DraftButtons} from "./buttons/draft.buttons";

// Singleton
export class DraftService{
    draftEmbedObjectArray: DraftEmbedObject[] = [];

    draftEmbeds: DraftEmbeds = new DraftEmbeds();
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();
    draftButtons: DraftButtons = new DraftButtons();
    private static _instance: DraftService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    @SignEmbed
    getDraftFFA(interaction: CommandInteraction, draftEmbedObject: DraftEmbedObject): MessageEmbed {
        DraftEmbedObjectRoutine.setType(draftEmbedObject,"ffa");
        if(draftEmbedObject.users.length == 0)
            return this.botlibEmbeds.error("Для выполнения этой команды вы должны находиться в канале.");
        if(draftEmbedObject.amount > 16)
            return this.botlibEmbeds.error("Не более 16 лидеров для одного игрока.");
        if(draftEmbedObject.draft[0] == undefined)
            return this.botlibEmbeds.error("Недостаточно цивилизаций для такого драфта.");

        let lastDEO: DraftEmbedObject | undefined = this.draftEmbedObjectArray.filter((x: DraftEmbedObject) => (x.guildID == draftEmbedObject.guildID))[0];
        if(lastDEO) {
            if(lastDEO.isProcessing)
                return this.botlibEmbeds.error("В данный момент уже проводится драфт. Пожалуйста, подождите.");
            else
                this.draftEmbedObjectArray[this.draftEmbedObjectArray.indexOf(lastDEO)] = draftEmbedObject;
        } else
            this.draftEmbedObjectArray.push(draftEmbedObject);

        return this.draftEmbeds.draftFFA(draftEmbedObject);
    }

    @SignEmbed
    getDraftTeamers(interaction: CommandInteraction, draftEmbedObject: DraftEmbedObject): MessageEmbed[]{
        DraftEmbedObjectRoutine.setType(draftEmbedObject,"teamers");
        if(draftEmbedObject.amount < 2 || draftEmbedObject.amount > 6)
            return [this.botlibEmbeds.error("Поддерживается от 2 до 6 команд.")];

        let lastDEO: DraftEmbedObject | undefined = this.draftEmbedObjectArray.filter((x: DraftEmbedObject) => (x.guildID == draftEmbedObject.guildID))[0];
        if(lastDEO) {
            if(lastDEO.isProcessing)
                return [this.botlibEmbeds.error("В данный момент уже проводится драфт. Пожалуйста, подождите.")];
            else
                this.draftEmbedObjectArray[this.draftEmbedObjectArray.indexOf(lastDEO)] = draftEmbedObject;
        } else
            this.draftEmbedObjectArray.push(draftEmbedObject);

        return this.draftEmbeds.draftTeamers(draftEmbedObject);
    }

    async getDraftBlind(interaction: CommandInteraction, draftEmbedObject: DraftEmbedObject): Promise<MessageEmbed>{
        DraftEmbedObjectRoutine.setType(draftEmbedObject,"blind");
        if(draftEmbedObject.users.length == 0)
            return this.botlibEmbeds.error("Для выполнения этой команды вы должны находиться в канале.");
        if(draftEmbedObject.amount > 16)
            return this.botlibEmbeds.error("Не более 16 лидеров для одного игрока.");
        if(draftEmbedObject.draft[0] == undefined)
            return this.botlibEmbeds.error("Недостаточно цивилизаций для такого драфта.");

        let lastDEO: DraftEmbedObject | undefined = this.draftEmbedObjectArray.filter((x: DraftEmbedObject) => (x.guildID == draftEmbedObject.guildID))[0];
        if(lastDEO) {
            if(lastDEO.isProcessing)
                return this.botlibEmbeds.error("В данный момент уже проводится драфт. Пожалуйста, подождите.");
            else
                this.draftEmbedObjectArray[this.draftEmbedObjectArray.indexOf(lastDEO)] = draftEmbedObject;
        } else
            this.draftEmbedObjectArray.push(draftEmbedObject);

        draftEmbedObject.isProcessing = true;
        try{
            for(let i: number = 0; i < draftEmbedObject.users.length; i++) {
                let msg: Message = await draftEmbedObject.users[i].send({
                    embeds: [this.draftEmbeds.draftBlindPm(draftEmbedObject, i)],
                    components: this.draftButtons.blindPmRows(draftEmbedObject, i)
                });
                draftEmbedObject.pmArray.push(msg);
            }
            return this.draftEmbeds.draftBlindProcessing(draftEmbedObject);
        } catch (e) {
            this.draftEmbedObjectArray.splice(this.draftEmbedObjectArray.indexOf(draftEmbedObject), 1)
            return this.botlibEmbeds.error("Один из игроков заблокировал бота. Провести драфт невозможно.");
        }
    }

    getRedraft(interaction: CommandInteraction){
        let lastDEO: DraftEmbedObject | undefined = this.draftEmbedObjectArray.filter((x) => (x.guildID == interaction.guildId))[0];
        if(!lastDEO) {
            interaction.reply({embeds: [this.botlibEmbeds.error("Драфта для редрафта не найдено.")]});
            return;
        }
        if(lastDEO.isProcessing){
            interaction.reply({embeds: [this.botlibEmbeds.error("В данный момент уже проводится драфт. Пожалуйста, подождите.")]});
            return;
        }
        if(lastDEO.users.indexOf(interaction.user) == -1){
            interaction.reply({embeds: [this.botlibEmbeds.error("Вашего драфта для редрафта не найдено.")]});
            return;
        }

        lastDEO.redraftMinAmount = Math.min(
            lastDEO.users.length,
            Math.floor(lastDEO.users.length/2)+1+lastDEO.redraftCounter
        );
        lastDEO.interaction = interaction;
        lastDEO.isProcessing = true;

        interaction.reply( {
            embeds: [this.draftEmbeds.redraftProcessing(lastDEO)],
            components: this.draftButtons.redraftButtons()
        });
    }

    async runRedraft(draftEmbedObject: DraftEmbedObject){
        let redraftEmbed: MessageEmbed = this.draftEmbeds.redraftProcessing(draftEmbedObject);
        draftEmbedObject.redraftCounter += 1;
        draftEmbedObject.redraftResult = -1;
        switch(draftEmbedObject.type){
            case "ffa":
                return await draftEmbedObject.interaction.editReply({embeds: [redraftEmbed, this.getDraftFFA(draftEmbedObject.interaction, draftEmbedObject)], components: []});
            case "teamers":
                let teamersEmbeds: MessageEmbed[] = this.getDraftTeamers(draftEmbedObject.interaction, draftEmbedObject);
                teamersEmbeds.unshift(redraftEmbed);
                return await draftEmbedObject.interaction.editReply({embeds: teamersEmbeds, components: []});
            case "blind":
                return await draftEmbedObject.interaction.editReply({embeds: [redraftEmbed, await this.getDraftBlind(draftEmbedObject.interaction, draftEmbedObject)], components: this.draftButtons.blindDelete()});
        }
    }
}


class DraftEmbedObjectRoutine{
    static draftConfig: DraftConfig = new DraftConfig();

    static setType(draftEmbedObject: DraftEmbedObject, type: "ffa" | "teamers" | "blind"): void{
        draftEmbedObject.type = type;
        draftEmbedObject.draft = [];
        draftEmbedObject.usersReadyBlind = new Array(draftEmbedObject.users.length).fill(false);
        draftEmbedObject.redraftStatus = new Array(draftEmbedObject.users.length).fill(-1);

        draftEmbedObject.civilizations = Array.from(DraftEmbedObjectRoutine.draftConfig.civilizations.values());
        for(let rawBan of draftEmbedObject.rawBans){
            if(DraftEmbedObjectRoutine.draftConfig.civilizations.has(rawBan))
                draftEmbedObject.bans.push(DraftEmbedObjectRoutine.draftConfig.civilizations.get(rawBan) as string);
            else if (rawBan != '')
                draftEmbedObject.errors.push(rawBan);
        }
        draftEmbedObject.bans = draftEmbedObject.bans.filter((value, index, self): boolean => {return self.indexOf(value) === index;});
        for(let ban of draftEmbedObject.bans)
            if(draftEmbedObject.civilizations.indexOf(ban) != -1)
                draftEmbedObject.civilizations.splice(draftEmbedObject.civilizations.indexOf(ban), 1);

        switch(type){
            case "blind":
            case "ffa":
                if(draftEmbedObject.amount == 0)
                    draftEmbedObject.amount = Math.min(Math.floor(draftEmbedObject.civilizations.length / draftEmbedObject.users.length), 16);
                if((draftEmbedObject.users.length != 0) && (draftEmbedObject.amount <= 16) && (draftEmbedObject.amount * draftEmbedObject.users.length <= draftEmbedObject.civilizations.length))
                    for (let i = 0; i < draftEmbedObject.users.length; i++){
                        draftEmbedObject.draft.push([]);
                        for (let j = 0; j < draftEmbedObject.amount; j++)
                            draftEmbedObject.draft[i].push(draftEmbedObject.civilizations.splice(Math.floor(Math.random()*draftEmbedObject.civilizations.length), 1)[0]);
                    }
                break;
            case "teamers":
                if(draftEmbedObject.amount >= 2 && draftEmbedObject.amount <= 6){
                    let civilizationPerTeam: number = Math.floor(draftEmbedObject.civilizations.length / draftEmbedObject.amount);
                    for(let i = 0; i < draftEmbedObject.amount; i++){
                        draftEmbedObject.draft.push([]);
                        for (let j = 0; j < civilizationPerTeam; j++)
                            draftEmbedObject.draft[i].push(draftEmbedObject.civilizations.splice(Math.floor(Math.random()*draftEmbedObject.civilizations.length), 1)[0]);
                    }
                    let correctDraft: boolean = true;
                    let swapIndex: number = -1;
                    do{
                        correctDraft = true;
                        for(let i = 0; i < draftEmbedObject.amount; i++){
                            swapIndex = this.getDraftSwapIndex(draftEmbedObject.draft[i]);
                            if(swapIndex != -1){
                                correctDraft = false;
                                let randomSwapIndex: number = Math.floor(Math.random()*draftEmbedObject.draft[0].length);
                                let temp: string = draftEmbedObject.draft[i][swapIndex];
                                draftEmbedObject.draft[i][swapIndex] = draftEmbedObject.draft[(i+1) % draftEmbedObject.amount][randomSwapIndex];
                                draftEmbedObject.draft[(i+1) % draftEmbedObject.amount][randomSwapIndex] = temp;
                            }
                        }
                    } while(!correctDraft);
                }
                break;
        }
        draftEmbedObject.draft.forEach(draft => draft.sort());
        return;
    }

    private static getDraftSwapIndex(draft: string[]): number{
        let civilizations: string[] = Array.from(this.draftConfig.civilizations.values());
        let swapIndex: number = -1;
        for(let pair of this.draftConfig.indexNationPairArray){
            swapIndex = function(draft, pair){
                let indexA = draft.indexOf(civilizations[pair[0]]);
                let indexB = draft.indexOf(civilizations[pair[1]]);
                if(indexA != -1 && indexB != -1)
                    return Math.random() <= 0.5 ? indexA : indexB;
                return -1;
            }(draft, pair);
            if(swapIndex != -1)
                return swapIndex;
        }
        return swapIndex;
    }
}
