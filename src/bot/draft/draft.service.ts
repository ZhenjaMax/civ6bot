import {CommandInteraction, Message, MessageEmbed, TextChannel, User} from "discord.js";
import {DraftEmbedObject} from "./draft.models"
import {BotlibEmbeds, signEmbed} from "../../botlib/botlib.embeds";
import {DraftEmbeds} from "./draft.embeds";
import {DraftConfig} from "./draft.config";
import {DraftButtons} from "./buttons/draft.buttons";
import {BotlibCivilizations} from "../../botlib/botlib.civilizations";

export class DraftService{
    draftEmbedObjectArray: DraftEmbedObject[] = [];
    draftEmbeds: DraftEmbeds = new DraftEmbeds();
    botlibEmbeds: BotlibEmbeds = new BotlibEmbeds();
    draftConfig: DraftConfig = new DraftConfig();
    draftButtons: DraftButtons = new DraftButtons();
    draftEmbedObjectRoutine: DraftEmbedObjectRoutine = new DraftEmbedObjectRoutine();

    private static _instance: DraftService;
    private constructor() {}
    public static get Instance(){
        return this._instance || (this._instance = new this());
    }

    private async checkDEO(DEO: DraftEmbedObject): Promise<boolean>{
        if(DEO.users.length == 0) {
            await DEO.interaction.reply({embeds: this.botlibEmbeds.error("Для выполнения этой команды вы должны находиться в голосовом канале."), ephemeral: true});
            return false;
        }
        switch(DEO.type) {
            case "FFA":
                if(DEO.amount < this.draftConfig.ffaCivilizationMin || DEO.amount > this.draftConfig.ffaCivilizationMax) {
                    await DEO.interaction.reply({embeds: this.botlibEmbeds.error(`Поддерживается от ${this.draftConfig.ffaCivilizationMin} до ${this.draftConfig.ffaCivilizationMax} лидеров для одного игрока.`), ephemeral: true});
                    return false;
                }
                break;
            case "Teamers":
                if(DEO.amount < this.draftConfig.teamersCommandsMin || DEO.amount > this.draftConfig.teamersCommandsMax) {
                    await DEO.interaction.reply({embeds: this.botlibEmbeds.error(`Поддерживается от ${this.draftConfig.teamersCommandsMin} до ${this.draftConfig.teamersCommandsMax} команд.`), ephemeral: true});
                    return false
                }
                break;
            case "Blind":
                if(DEO.amount < this.draftConfig.blindCivilizationMin || DEO.amount > this.draftConfig.blindCivilizationMax){
                    await DEO.interaction.reply( {embeds: this.botlibEmbeds.error(`Поддерживается от ${this.draftConfig.blindCivilizationMin} до ${this.draftConfig.blindCivilizationMax} лидеров для одного игрока.`), ephemeral: true});
                    return false;
                }
                break;
        }
        if(DEO.draft[0] == undefined) {
            await DEO.interaction.reply({embeds: this.botlibEmbeds.error("Недостаточно цивилизаций для такого драфта.")});
            return false;
        }
        let lastDEO: DraftEmbedObject | undefined = this.draftEmbedObjectArray.filter((x: DraftEmbedObject) => (x.guildID == DEO.guildID))[0];
        if(lastDEO) {
            if(lastDEO.isProcessing) {
                await DEO.interaction.reply({embeds: this.botlibEmbeds.error("В данный момент уже проводится драфт. Пожалуйста, подождите."), ephemeral: true});
                return false;
            }
            this.draftEmbedObjectArray[this.draftEmbedObjectArray.indexOf(lastDEO)] = DEO;
        } else
            this.draftEmbedObjectArray.push(DEO);
        return true;
    }

    private async checkRedraftDEO(lastDEO: DraftEmbedObject, interaction: CommandInteraction): Promise<boolean>{
        if(!lastDEO) {
            await interaction.reply({embeds: this.botlibEmbeds.error("Драфта для редрафта не найдено.")});
            return false;
        }
        if(lastDEO.isProcessing) {
            await interaction.reply({embeds: this.botlibEmbeds.error("В данный момент уже проводится драфт. Пожалуйста, подождите.")});
            return false;
        }
        if(lastDEO.users.indexOf(interaction.user) == -1) {
            await interaction.reply({embeds: this.botlibEmbeds.error("Вашего драфта для редрафта не найдено.")});
            return false;
        }
        return true;
    }

    async getDraftFFA(interaction: CommandInteraction, amount: number, bans: string) {
        let draftEmbedObject = new DraftEmbedObject(interaction, amount, bans);
        this.draftEmbedObjectRoutine.setType(draftEmbedObject,"FFA");
        if(!await this.checkDEO(draftEmbedObject))
            return;
        return await interaction.reply( {embeds: signEmbed(interaction, this.draftEmbeds.draftFFA(draftEmbedObject))});
    }

    async getDraftTeamers(interaction: CommandInteraction, amount: number, bans: string) {
        let draftEmbedObject = new DraftEmbedObject(interaction, amount, bans);
        this.draftEmbedObjectRoutine.setType(draftEmbedObject,"Teamers");
        if(!await this.checkDEO(draftEmbedObject))
            return;
        return interaction.reply({embeds: signEmbed(interaction, this.draftEmbeds.draftTeamers(draftEmbedObject))});
    }

    async getDraftBlind(interaction: CommandInteraction, amount: number, bans: string) {
        let draftEmbedObject = new DraftEmbedObject(interaction, amount, bans);
        this.draftEmbedObjectRoutine.setType(draftEmbedObject,"Blind");
        if(!await this.checkDEO(draftEmbedObject))
            return;

        draftEmbedObject.isProcessing = true;
        try{
            for(let i: number = 0; i < draftEmbedObject.users.length; i++)
                draftEmbedObject.pmArray.push(await draftEmbedObject.users[i].send({
                    embeds: [this.draftEmbeds.draftBlindPm(draftEmbedObject, i)],
                    components: this.draftButtons.blindPmRows(draftEmbedObject, i)
                }));
            draftEmbedObject.blindChatMessage = await interaction.reply({
                embeds: signEmbed(interaction, this.draftEmbeds.draftBlindProcessing(draftEmbedObject)),
                components: this.draftButtons.blindDelete(),
                fetchReply: true
            }) as Message;
        } catch (blindError) {
            draftEmbedObject.isProcessing = false;
            this.draftEmbedObjectArray.splice(this.draftEmbedObjectArray.indexOf(draftEmbedObject), 1);
            draftEmbedObject.pmArray.forEach(x => x.delete());
            let user: User = draftEmbedObject.users[draftEmbedObject.pmArray.length];
            let msg: MessageEmbed[] = this.botlibEmbeds.error(`Один из игроков (${user.toString()}) заблокировал бота. Провести драфт невозможно.`);
            return await interaction.reply({embeds: msg});
        }
    }

    async getRedraft(interaction: CommandInteraction){
        let lastDEO: DraftEmbedObject | undefined = this.draftEmbedObjectArray.filter((x) => (x.guildID == interaction.guildId))[0];
        if(!await this.checkRedraftDEO(lastDEO, interaction))
            return;
        lastDEO.redraftMinAmount = Math.min(lastDEO.users.length, Math.floor(lastDEO.users.length/2)+1+lastDEO.redraftCounter);
        lastDEO.interaction = interaction;
        lastDEO.isProcessing = true;
        await interaction.reply( {
            embeds: signEmbed(interaction, this.draftEmbeds.redraftProcessing(lastDEO)),
            components: this.draftButtons.redraftButtons()
        });
    }

    async runRedraft(draftEmbedObject: DraftEmbedObject){
        let channel: TextChannel = draftEmbedObject.interaction.channel as TextChannel;
        draftEmbedObject.redraftCounter += 1;
        draftEmbedObject.redraftResult = -1;
        this.draftEmbedObjectRoutine.setType(draftEmbedObject, draftEmbedObject.type);
        switch(draftEmbedObject.type){
            case "FFA":
                return await channel.send({embeds: signEmbed(draftEmbedObject.interaction, this.draftEmbeds.draftFFA(draftEmbedObject))});
            case "Teamers":
                return await channel.send({embeds: signEmbed(draftEmbedObject.interaction, this.draftEmbeds.draftTeamers(draftEmbedObject))});
            case "Blind":
                draftEmbedObject.isProcessing = true;
                try{
                    for(let i: number = 0; i < draftEmbedObject.users.length; i++)
                        draftEmbedObject.pmArray.push(await draftEmbedObject.users[i].send({
                            embeds: [this.draftEmbeds.draftBlindPm(draftEmbedObject, i)],
                            components: this.draftButtons.blindPmRows(draftEmbedObject, i)
                        }));
                    draftEmbedObject.blindChatMessage = await channel.send({
                        embeds: signEmbed(draftEmbedObject.interaction, this.draftEmbeds.draftBlindProcessing(draftEmbedObject)),
                        components: this.draftButtons.blindDelete(),
                    });
                } catch (blindError) {
                    let user: User = draftEmbedObject.users[draftEmbedObject.pmArray.length];
                    let msg: MessageEmbed[] = (user)
                        ? this.botlibEmbeds.error(`Один из игроков (${user.toString()}) заблокировал бота. Провести драфт невозможно.`)
                        : this.botlibEmbeds.error(`Неизвестная ошибка при исполнении драфта взакрытую.`);
                    draftEmbedObject.pmArray.forEach(x => x.delete());
                    this.draftEmbedObjectArray.splice(this.draftEmbedObjectArray.indexOf(draftEmbedObject), 1);
                    return await draftEmbedObject.interaction.reply( {embeds: msg});
                }
        }
    }
}

class DraftEmbedObjectRoutine{
    draftConfig: DraftConfig = new DraftConfig();
    botlibCivilizations: BotlibCivilizations = new BotlibCivilizations();

    // Генерирует драфт
    setType(draftEmbedObject: DraftEmbedObject, type: "FFA" | "Teamers" | "Blind" | undefined): void{
        draftEmbedObject.type = type;
        draftEmbedObject.draft = [];
        draftEmbedObject.usersReadyBlind = new Array(draftEmbedObject.users.length).fill(false);
        draftEmbedObject.redraftStatus = new Array(draftEmbedObject.users.length).fill(-1);
        draftEmbedObject.pmArray = [];
        draftEmbedObject.civilizations = Array.from(this.botlibCivilizations.civilizations.values());
        for(let rawBan of draftEmbedObject.rawBans){
            if(this.botlibCivilizations.civilizations.has(rawBan))
                draftEmbedObject.bans.push(this.botlibCivilizations.civilizations.get(rawBan) as string);
            else if (rawBan != '')
                draftEmbedObject.errors.push(rawBan);
        }
        draftEmbedObject.bans = draftEmbedObject.bans.filter((value, index, self): boolean => {return self.indexOf(value) === index;});
        for(let ban of draftEmbedObject.bans)
            if(draftEmbedObject.civilizations.indexOf(ban) != -1)
                draftEmbedObject.civilizations.splice(draftEmbedObject.civilizations.indexOf(ban), 1);

        switch(type){
            case "Blind":
            case "FFA":
                if(draftEmbedObject.amount == 0)
                    draftEmbedObject.amount = Math.min(Math.floor(draftEmbedObject.civilizations.length / draftEmbedObject.users.length), this.draftConfig.ffaCivilizationMax);
                if((draftEmbedObject.users.length != 0) && (draftEmbedObject.amount <= this.draftConfig.ffaCivilizationMax) && (draftEmbedObject.amount * draftEmbedObject.users.length <= draftEmbedObject.civilizations.length))
                    for (let i = 0; i < draftEmbedObject.users.length; i++){
                        draftEmbedObject.draft.push([]);
                        for (let j = 0; j < draftEmbedObject.amount; j++)
                            draftEmbedObject.draft[i].push(draftEmbedObject.civilizations.splice(Math.floor(Math.random()*draftEmbedObject.civilizations.length), 1)[0]);
                    }
                break;
            case "Teamers":
                if(draftEmbedObject.amount >= this.draftConfig.teamersCommandsMin && draftEmbedObject.amount <= this.draftConfig.teamersCommandsMax){
                    let civilizationPerTeam: number = Math.floor(draftEmbedObject.civilizations.length / draftEmbedObject.amount);
                    for(let i = 0; i < draftEmbedObject.amount; i++){
                        draftEmbedObject.draft.push([]);
                        for (let j = 0; j < civilizationPerTeam; j++)
                            draftEmbedObject.draft[i].push(draftEmbedObject.civilizations.splice(Math.floor(Math.random()*draftEmbedObject.civilizations.length), 1)[0]);
                    }
                    let correctDraft: boolean = true;
                    let swapIndex: number = -1;
                    do {
                        correctDraft = true;
                        for(let i = 0; i < draftEmbedObject.amount; i++){
                            swapIndex = this.getDraftSwapIndex(draftEmbedObject.draft[i]);
                            if(swapIndex != -1){
                                correctDraft = false;
                                let randomSwapIndex: number = Math.floor(Math.random()*draftEmbedObject.draft[0].length);
                                let temp: string = draftEmbedObject.draft[i][swapIndex];
                                draftEmbedObject.draft[i][swapIndex] = draftEmbedObject.draft[(i+1) % draftEmbedObject.amount][randomSwapIndex];
                                draftEmbedObject.draft[(i+1)%draftEmbedObject.amount][randomSwapIndex] = temp;
                            }
                        }
                    } while(!correctDraft);
                }
                break;
        }
        draftEmbedObject.draft.forEach(draft => draft.sort());
        return;
    }

    private getDraftSwapIndex(draft: string[]): number{
        let civilizations: string[] = Array.from(this.botlibCivilizations.civilizations.values());
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
