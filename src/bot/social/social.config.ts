import {ColorResolvable} from "discord.js";

export class SocialConfig{
    maxBonusStreak: number = 7;

    ratingChanceBase: number = 0.07;
    fameChanceBase: number = 0.14;
    fameChancePremium: number = 0.5;

    ratingBase: number = 1;
    fameBase: number = 1;
    famePremium: number = 3;

    //fameForDislikeMin: number = 50;
    //moneyBase: number = 25;

    colorList: ColorResolvable[] = [
        "#ffff00",
        "#ffe100",
        "#ffc300",
        "#ffa600",
        "#ff8800",
        "#ff6600",
        "#ff4800",
        "#ff0000",
        "#ff0054"
    ];

    descriptionMaxLength: number = 255;
    imageURLMaxLength: number = 255;
}
