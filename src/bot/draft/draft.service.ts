import {CommandInteraction, MessageEmbed} from "discord.js";
import {DraftEmbedObject} from "./draft.models"
import {BotlibEmbeds, SignEmbed} from "../../botlib/botlib.embeds";
import {DraftEmbeds} from "./draft.embeds";
import {DraftConfig} from "./draft.config";
import {DraftButtons} from "./buttons/draft.buttons";

// Singleton
export class DraftService{
    lastDraftEmbedObject: DraftEmbedObject | undefined;
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
        if(this.lastDraftEmbedObject?.isProcessing)
            return this.botlibEmbeds.error("В данный момент уже проводится драфт. Пожалуйста, подождите.");
        this.lastDraftEmbedObject = draftEmbedObject;
        return this.draftEmbeds.draftFFA(draftEmbedObject);
    }

    @SignEmbed
    getDraftTeamers(interaction: CommandInteraction, draftEmbedObject: DraftEmbedObject): MessageEmbed[]{
        DraftEmbedObjectRoutine.setType(draftEmbedObject,"teamers");
        if(draftEmbedObject.amount < 2 || draftEmbedObject.amount > 6)
            return [this.botlibEmbeds.error("Поддерживается от 2 до 6 команд.")];
        if(this.lastDraftEmbedObject?.isProcessing)
            return [this.botlibEmbeds.error("В данный момент уже проводится драфт. Пожалуйста, подождите.")];
        this.lastDraftEmbedObject = draftEmbedObject;
        return this.draftEmbeds.draftTeamers(draftEmbedObject);
    }

    @SignEmbed
    getDraftBlind(interaction: CommandInteraction, draftEmbedObject: DraftEmbedObject): MessageEmbed{
        DraftEmbedObjectRoutine.setType(draftEmbedObject,"blind");
        if(draftEmbedObject.users.length == 0)
            return this.botlibEmbeds.error("Для выполнения этой команды вы должны находиться в канале.");
        if(draftEmbedObject.amount > 16)
            return this.botlibEmbeds.error("Не более 16 лидеров для одного игрока.");
        if(draftEmbedObject.draft[0] == undefined)
            return this.botlibEmbeds.error("Недостаточно цивилизаций для такого драфта.");
        if(this.lastDraftEmbedObject?.isProcessing && !draftEmbedObject.isProcessing)
            return this.botlibEmbeds.error("В данный момент уже проводится драфт. Пожалуйста, подождите.");

        try{
            this.lastDraftEmbedObject = draftEmbedObject;
            this.lastDraftEmbedObject.isProcessing = true;
            for(let i: number = 0; i < draftEmbedObject.users.length; i++)
                draftEmbedObject.users[i].send({
                    embeds: [this.draftEmbeds.draftBlindPm(draftEmbedObject, i)],
                    components: this.draftButtons.blindPmRows(draftEmbedObject, i)
                });
            return this.draftEmbeds.draftBlindProcessing(draftEmbedObject);
        } catch (e) {
            delete this.lastDraftEmbedObject;
            return this.botlibEmbeds.error("Один из игроков заблокировал бота!");
        }
    }

    getRedraft(interaction: CommandInteraction){
        if(this.lastDraftEmbedObject == undefined){
            interaction.reply({embeds: [this.botlibEmbeds.error("Драфта для редрафта не найдено.")]});
            return;
        }
        if(this.lastDraftEmbedObject.isProcessing){
            interaction.reply({embeds: [this.botlibEmbeds.error("В данный момент уже проводится драфт. Пожалуйста, подождите.")]});
            return;
        }
        if(this.lastDraftEmbedObject.users.indexOf(interaction.user) == -1){
            interaction.reply({embeds: [this.botlibEmbeds.error("Вашего драфта для редрафта не найдено.")]});
            return;
        }
        this.lastDraftEmbedObject.redraftMinAmount = Math.min(
            this.lastDraftEmbedObject.users.length,
            Math.floor(this.lastDraftEmbedObject.users.length/2)+1+this.lastDraftEmbedObject.redraftCounter
        );
        this.lastDraftEmbedObject.interaction = interaction;
        this.lastDraftEmbedObject.isProcessing = true;

        interaction.reply( {
            embeds: [this.draftEmbeds.redraftProcessing(this.lastDraftEmbedObject as DraftEmbedObject)],
            components: this.draftButtons.redraftButtons()
        });
    }

    runRedraft(draftEmbedObject: DraftEmbedObject){
        switch(draftEmbedObject.type){
            case "ffa":
                draftEmbedObject.interaction.editReply({embeds: [this.getDraftFFA(draftEmbedObject.interaction, draftEmbedObject)], components: []});
                return;
            case "teamers":
                draftEmbedObject.interaction.editReply({embeds: this.getDraftTeamers(draftEmbedObject.interaction, draftEmbedObject), components: []});
                return;
            case "blind":
                draftEmbedObject.interaction.editReply({embeds: [this.getDraftBlind(draftEmbedObject.interaction, draftEmbedObject)], components: []});
                return;
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
