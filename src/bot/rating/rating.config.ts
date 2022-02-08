export class RatingConfig{
    gameTypes: string[] = ["FFA", "Teamers"];
    victoryCommonNames: string[] = ["CC", "GG"];   // index=0 в БД
    victoryTypeList: string[] = ["science", "culture", "domination", "religious", "diplomatic"];
    victoryTypeNames: string[] = ["Научная", "Культурная", "Военная", "Религиозная", "Дипломатическая"];

    // A побеждает B
    ratingEloPair(ratingA: number, ratingB: number, D: number, K: number, isTie: boolean): number{
        let S: number = (isTie) ? 0.5 : 1;
        let E: number = 1/(1 + Math.pow(10, (ratingB - ratingA)/D));
        return Math.round(K*(S-E));
    }

    victoryThumbnailsURL: string[] = [
        "https://static.wikia.nocookie.net/civilization/images/4/44/Science_Victory_%28Civ6%29.png",
        "https://static.wikia.nocookie.net/civ6_gamepedia_en/images/6/61/Icon_victory_culture.png",
        "https://static.wikia.nocookie.net/civ6_gamepedia_en/images/f/f7/Icon_victory_default.png",
        "https://static.wikia.nocookie.net/civ6_gamepedia_en/images/1/1c/Icon_victory_religious.png",
        "https://static.wikia.nocookie.net/civilization/images/1/1e/Diplomatic_Victory_%28Civ6%29.png/revision/latest/scale-to-width-down/220?cb=20200430082219",
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
}
