import {IRatingNote} from "../../db/models/db.RatingNote";
import {IUserRating} from "../../db/models/db.UserRating";
import {RatingConfig} from "./rating.config";
import {ButtonInteraction, CommandInteraction, Message} from "discord.js";

export class RatingObject{
    ratingConfig: RatingConfig = new RatingConfig();
    message: Message | undefined;
    interaction: CommandInteraction | ButtonInteraction;
    messageWords: string[] = [];

    gameType: number = -1;       // 0=FFA, 1=Teamers
    victoryType: number = -1;    // 0=CC/GG
    usersID: string[] = [];
    commandsAmount: number = -1;
    usersPerCommand: number = -1;

    tieIndex: number[][] = [];
    subIndex: number[] = [];
    subUsersID: string[] = [];
    leaveUsersID: string[] = [];    // SUB может быть LEAVE, но у SUB нет однозначного индекса,
                                    // поэтому только ID
    ratingNotes: IRatingNote[] = [];
    ratingNotesSub: IRatingNote[] = [];

    winners: number[] = [];
    usernames: string[] = [];
    date: Date = new Date();

    constructor(interaction: CommandInteraction, gameType: string, victoryType: string, message: string, commandsAmount: number) {
        this.interaction = interaction;
        this.gameType = this.ratingConfig.gameTypes.indexOf(gameType);
        this.victoryType = this.ratingConfig.victoryTypeList.indexOf(victoryType)+1;
        this.messageWords = message
            .toLowerCase()
            .replaceAll(">", " ")
            .replaceAll("<@!", " ")
            .replaceAll("<@", " ")
            .split(/[\n ]+/)
            .filter(x => (x != ''));
        this.commandsAmount = commandsAmount;
    }

    // Если всё запихать в конструктор, то
    // оно не будет работать:
    // ## Fatal error in , line 0
    // ## Fatal JavaScript invalid size error 169220804
    // Поэтому вынесено в отдельный метод
    init(): number{
        for(let i: number = 0; i < this.messageWords.length; i++)
            switch (this.messageWords[i]) {
                case "tie":
                    if(this.usersID.length == 0)
                        return 1;
                    //this.usersID.push(this.messageWords[i++]);
                    i++;
                    if(!this.messageWords[i])
                        return 2;
                    this.usersID.push(this.messageWords[i]);
                    this.tieIndex.push([this.usersID.length-2, this.usersID.length-1]);
                    break;
                case "sub":
                    if(this.usersID.length == 0)
                        return 3;
                    //this.usersID.push(this.messageWords[i++]);
                    i++;
                    if(!this.messageWords[i])
                        return 4;
                    this.subUsersID.push(this.messageWords[i]);
                    this.subIndex.push(this.usersID.length-1);
                    break;
                case "leave":
                    if(this.usersID.length == 0)
                        return 5;
                    if(this.usersID.length-1 == this.subIndex[this.subIndex.length-1])      // Если LEAVE после
                        this.leaveUsersID.push(this.subUsersID[this.subUsersID.length-1]);  // заменяющего в SUB
                    else                                                                    // ... 11 SUB 12 LEAVE ...
                        this.leaveUsersID.push(this.usersID[this.usersID.length-1]);
                    break;
                default:
                    this.usersID.push(this.messageWords[i]);
                    break;
            }

        for(let i in this.usersID)              // Корректные ID пользователей
            if(!(Number(this.usersID[i])>=0))
                return 6;
        if((this.usersID.length > this.ratingConfig.maxUsers) || (this.usersID.length < this.ratingConfig.minUsers))
            return 7;
        for(let i: number = 0; i < this.subUsersID.length; i++) // Корректные ID замен
            if(!(Number(this.subUsersID[i])>=0))
                return 8;
        for(let i in this.usersID)              // Пользователи без повторений
            if(this.usersID.filter(x => x==this.usersID[i]).length > 1)
                return 9;
        for(let i in this.subUsersID){          // Замены без повторений
            if(this.subUsersID.filter(x => x==this.subUsersID[i]).length > 1)
                return 10;
            if(this.usersID.filter(x => x==this.subUsersID[i]).length > 0) // SUB без повторений в пользователях
                return 11;
        }
        for(let i in this.leaveUsersID) // LEAVE ID без повторений
            if(this.leaveUsersID.filter(x => x==this.leaveUsersID[i]).length > 1)
                return 12;

        if(this.commandsAmount != 0) {
            if(this.usersID.length % this.commandsAmount)    // Проверка на возможность разделить на команды
                return 13;
        } else
            this.commandsAmount = this.usersID.length;
        this.usersPerCommand = this.usersID.length / this.commandsAmount;

        if(this.usersPerCommand != 1)
            for(let i in this.tieIndex) {
                for(let j in this.tieIndex[i])          // Приведение по числу игроков в команде
                    this.tieIndex[i][j] = Math.floor(this.tieIndex[i][j] / this.usersPerCommand);
                for(let j in this.tieIndex[i])          // Проверка на TIE в пределах одной команды
                    if(this.tieIndex[i].filter(x => x==this.tieIndex[i][j]).length > 1)
                        return 14;
            }
        for(let i: number = 0; i < this.tieIndex.length-1; i++) // Объединение смежных TIE
            if(this.tieIndex[i][this.tieIndex[i].length-1] == this.tieIndex[i+1][0]){
                this.tieIndex[i].push(this.tieIndex[i+1][1]);
                this.tieIndex.splice(i+1, 1);
                i--;
            }
        for(let i: number = 0; i < this.usersPerCommand; i++)
            this.winners.push(i);
        if(this.tieIndex.length > 0)
            if(this.tieIndex[0].indexOf(0) != -1)
                for(let i: number = 1; i < this.tieIndex[0].length; i++)
                    for(let j: number = 0; j < this.usersPerCommand; j++)
                        this.winners.push(this.tieIndex[0][i]*this.usersPerCommand+j);
        // Если все проверки пройдены, то правильно
        return 0;
    }

    private getTieFlag(i: number, j: number): boolean{
        i = Math.floor(i/this.usersPerCommand);
        j = Math.floor(j/this.usersPerCommand);
        for(let k in this.tieIndex)
            if((this.tieIndex[k].indexOf(i) != -1) && (this.tieIndex[k].indexOf(j) != -1))
                return true;
        return false;
    }

    loadNotes(ratingNotes: IRatingNote[], ratingNotesSub: IRatingNote[] = []){
        this.ratingNotes = ratingNotes;
        this.ratingNotesSub = ratingNotesSub;
    }

    calculateNotes(gameID: number, userRatingsConcat: IUserRating[]){
        userRatingsConcat.forEach(x => {this.ratingNotes.push({
            guildID: x.guildID,
            gameID: gameID,
            gameType: this.gameType,
            victoryType: -1,
            isActive: true,

            userID: x.userID,
            rating: 0,
            ratingTyped: 0,
            money: 0,
            fame: 0
        })});
        this.ratingNotesSub = this.ratingNotes.splice(this.ratingNotes.length-this.subUsersID.length);
        let userRatingsSub: IUserRating[] = userRatingsConcat.slice(this.ratingNotes.length);
        let userRatings: IUserRating[] = userRatingsConcat.slice(0, this.ratingNotes.length);

        let rating: number, ratingTyped: number, isTie: boolean, currentSubIndex: number;
        for(let i: number = 0; i < this.ratingNotes.length; i++) {
            for (let j: number = Math.ceil((i+1)/this.usersPerCommand)*this.usersPerCommand; j < this.ratingNotes.length; j++) {
                isTie = this.getTieFlag(i, j);
                rating = this.ratingConfig.ratingEloPair(userRatings[i].rating, userRatings[j].rating, isTie);
                ratingTyped = (this.gameType == 1)
                    ? this.ratingConfig.ratingEloPair(userRatings[i].ratingTeamers, userRatings[j].ratingTeamers, isTie)
                    : this.ratingConfig.ratingEloPair(userRatings[i].ratingFFA, userRatings[j].ratingFFA, isTie);
                this.ratingNotes[i].rating += rating;
                this.ratingNotes[j].rating -= rating;
                this.ratingNotes[i].ratingTyped += ratingTyped;
                this.ratingNotes[j].ratingTyped -= ratingTyped;
            }
            currentSubIndex = this.subIndex.indexOf(i);
            if (currentSubIndex != -1) {
                if (this.leaveUsersID.indexOf(this.subUsersID[currentSubIndex]) == -1) {    // Если замена не ливнула, то пополам
                    this.ratingNotes[i].rating = Math.round(this.ratingNotes[i].rating / 2);
                    this.ratingNotes[i].ratingTyped = Math.round(this.ratingNotes[i].ratingTyped / 2);
                    this.ratingNotesSub[currentSubIndex].rating = this.ratingNotes[i].rating;
                    this.ratingNotesSub[currentSubIndex].ratingTyped = this.ratingNotes[i].ratingTyped;
                } else {    // Если замена ливнула, то побеждаешь её и весь отрицательный рейтинг на неё
                    rating = this.ratingConfig.ratingEloPair(userRatings[i].rating, userRatingsSub[currentSubIndex].rating, false);
                    ratingTyped = (this.gameType == 1)
                        ? this.ratingConfig.ratingEloPair(userRatings[i].ratingTeamers, userRatingsSub[currentSubIndex].ratingTeamers, false)
                        : this.ratingConfig.ratingEloPair(userRatings[i].ratingFFA, userRatingsSub[currentSubIndex].ratingFFA, false);
                    this.ratingNotes[i].rating += rating;
                    this.ratingNotesSub[currentSubIndex].rating -= rating;
                    this.ratingNotes[i].ratingTyped += ratingTyped;
                    this.ratingNotesSub[currentSubIndex].ratingTyped -= ratingTyped;
                    if(this.ratingNotes[i].rating < 0){
                        this.ratingNotesSub[currentSubIndex].rating += this.ratingNotes[i].rating;
                        this.ratingNotes[i].rating = 0;
                    }
                    if(this.ratingNotes[i].ratingTyped < 0){
                        this.ratingNotesSub[currentSubIndex].ratingTyped += this.ratingNotes[i].ratingTyped;
                        this.ratingNotes[i].ratingTyped = 0;
                    }
                }
            }
            this.ratingNotes[i].fame = 2*this.usersID.length;
            if(this.winners.indexOf(i) != -1) {
                this.ratingNotes[i].fame += this.usersID.length;
                this.ratingNotes[i].victoryType = this.victoryType;
            }
            this.ratingNotes[i].money = this.ratingNotes[i].fame + this.ratingNotes[i].ratingTyped + this.ratingConfig.baseGold*this.usersID.length;
            if(this.victoryType != 0){
                this.ratingNotes[i].fame += this.usersID.length;
                this.ratingNotes[i].money = Math.round(this.ratingConfig.multiplierMoney*this.ratingNotes[i].money);
                this.ratingNotes[i].rating = Math.round(this.ratingConfig.multiplierRating*this.ratingNotes[i].rating);
                this.ratingNotes[i].ratingTyped = Math.round(this.ratingConfig.multiplierRating*this.ratingNotes[i].ratingTyped);
            }
            if (this.leaveUsersID.indexOf(this.ratingNotes[i].userID) != -1) {
                this.ratingNotes[i].fame = 0;
                this.ratingNotes[i].money = 0;
            }
        }
        for(let i: number = 0; i < this.ratingNotesSub.length; i++){
            this.ratingNotesSub[i].fame = this.ratingNotes.length;
            this.ratingNotesSub[i].money = this.ratingNotesSub[i].fame + this.ratingNotesSub[i].ratingTyped + this.ratingConfig.baseGold;
            if(this.victoryType != 0){
                this.ratingNotesSub[i].money = Math.round(this.ratingConfig.multiplierMoney*this.ratingNotesSub[i].money);
                this.ratingNotesSub[i].rating = Math.round(this.ratingConfig.multiplierRating*this.ratingNotesSub[i].rating);
                this.ratingNotesSub[i].ratingTyped = Math.round(this.ratingConfig.multiplierRating*this.ratingNotesSub[i].ratingTyped);
            }
            if(this.leaveUsersID.indexOf(this.ratingNotesSub[i].userID) != -1){
                this.ratingNotesSub[i].fame = 0;
                this.ratingNotesSub[i].money = 0;
            }
        }
    }
}
