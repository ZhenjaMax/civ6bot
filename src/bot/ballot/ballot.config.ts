import {ColorResolvable} from "discord.js";

export class BallotConfig{
    lastGameWarningMinor: number = 14;
    lastGameWarningMajor: number = 30;
    lastBanWarningMajor: number = 7;
    lastBanWarningMinor: number = 14;

    colorBallot: ColorResolvable[] = [
        "#0088ff",
        "#ffe100",
        "#ff8800",
        "#ff0000",
        "#440000"
    ];

    ballotsMax: number = 20;
}
