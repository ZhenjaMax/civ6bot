export class DraftConfig{
    teamersThumbnailsURL: string[] = [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Antu_flag-red.svg/768px-Antu_flag-red.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Antu_flag-blue.svg/768px-Antu_flag-blue.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Antu_flag-green.svg/768px-Antu_flag-green.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Antu_flag-yellow.svg/768px-Antu_flag-yellow.svg.png",
        "https://media.discordapp.net/attachments/698295115063492758/837417222732644372/768px-Antu_flag-purple.svg.png?width=599&height=599",
        "https://cdn.discordapp.com/attachments/698295115063492758/838985443642310666/768px-Antu_flag-grey.svg.png",
    ];

    indexNationPairArray: number[][] = [
        [2, 39],    // Англия (Виктория), Финикия
        [31, 45],   // Норвегия, Япония
        [19, 37],   // Канада, Россия
        [23, 34],   // Кри, Персия
        [40, 28],   // Екатерина Медичи (Чёрная королева), Чингисхан
        [26, 57],   // Мали, Португалия

        //[40, 41],   // Екатерина Медичи (Чёрная Королева), Алиенора Французская
        //[2, 3],     // Виктория, Алиенора Английская
        [3, 41],    // Алиенора Английская, Алиенора Французская

        [9, 10],    // Греция (2)
        [14, 15],   // Индия (2)
        [1, 49],    // Америка (2)
        [28, 55],   // Монголия (2)
        [20, 54],   // Китай (2)
    ];

    teamersCommandsMin: number = 2;
    teamersCommandsMax: number = this.teamersThumbnailsURL.length;
}
