export class RatingConfig{
    gameTypes: string[] = ["FFA", "Teamers"];
    victoryCommonNames: string[] = ["CC", "GG"];   // index=0 в БД
    victoryTypeList: string[] = ["science", "culture", "domination", "religious", "diplomatic", "score"];
    victoryTypeNames: string[] = ["Научная", "Культурная", "Военная", "Религиозная", "Дипломатическая", "По очкам"];

    multiplierMoney: number = 1.5;
    multiplierRating: number = 1.3;
    baseGold: number = 35;

    D: number = 400;
    K: number = 30; // Максимальное количество рейтинга (по модулю) за дуэль (среднее = K/2 при равенстве рейтинга)

    // A побеждает B
    ratingEloPair(ratingA: number, ratingB: number, isTie: boolean): number{
        let D: number = this.D;
        let K: number = this.K;
        let S: number = (isTie) ? 0.5 : 1;
        let E: number = 1/(1 + Math.pow(10, (ratingB - ratingA)/D));
        return Math.round(K*(S-E));
    }

    roleRanksID: string[] = [
        '817181568388562984',
        '817181566722768907',
        '817181565381509131',
        '817181564122955776',
        '817181561837060117',
        '817181559412752397',
        '817181555247022080',
        '817181552156082263',
        '817181330088787989'
    ];

    roleRanksValue: number[] = [
    //  0,             0 ...  849 - строитель (0)
        850,      // 850 ...  899 - поселенец (1)
        900,      // 900 ...  999 - вождь (2)
        1000,     //1000 ... 1099 - военачальник (3)
        1100,     //1100 ... 1189 - князь (4)
        1190,     //1190 ... 1269 - король (5)
        1270,     //1270 ... 1339 - император (6)
        1340,     //1340 ... 1399 - бессмертный (7)
        1400,     //1400 ... +inf - божество (8)
    ];

    victoryThumbnailsURL: string[] = [
        "https://static.wikia.nocookie.net/civilization/images/4/44/Science_Victory_%28Civ6%29.png",
        "https://static.wikia.nocookie.net/civ6_gamepedia_en/images/6/61/Icon_victory_culture.png",
        "https://static.wikia.nocookie.net/civ6_gamepedia_en/images/f/f7/Icon_victory_default.png",
        "https://static.wikia.nocookie.net/civ6_gamepedia_en/images/1/1c/Icon_victory_religious.png",
        "https://static.wikia.nocookie.net/civilization/images/1/1e/Diplomatic_Victory_%28Civ6%29.png/revision/latest/scale-to-width-down/220?cb=20200430082219",
        "https://static.wikia.nocookie.net/civ6_gamepedia_en/images/2/27/Icon_victory_score.png"
    ];

    minUsers: number = 2;
    maxUsers: number = 16;

    errors: string[] = [
        "TIE в начале списка игроков",
        "TIE в конце списка игроков",
        "SUB в начале списка игроков",
        "SUB в конце списка игроков",
        "LEAVE в начале списка игроков",
        "Некорректные слова в перечислении игроков; допустимы упоминания игроков и слова TIE, LEAVE, SUB",
        `От ${this.minUsers} до ${this.maxUsers} игроков для записи рейтинга`,
        "Некорректные слова в перечислении замененных игроков; допустимы упоминания игроков и слова TIE, LEAVE, SUB",
        "Игроки в перечислении не должны повторяться",
        "Игроки в перечислении замен не должны повторяться",
        "Замененный игрок повторяется в списке основных игроков",
        "LEAVE используется дважды для одного игрока",
        "Невозможно разделить данный список игроков поровну",
        "TIE должен быть использован между командами, не между участниками одной команды"
    ];

    ratingChannelID: string = "817163438655537173";
    ratingReportsChannelID: string = "863810318785708092";
}
