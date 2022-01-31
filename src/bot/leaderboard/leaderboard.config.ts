import {ColorResolvable} from "discord.js";

export class LeaderboardConfig{
    minLeaderboardUsers: number = 1;
    maxLeaderboardUsers: number = 100;
    usersPerEmbed: number = 25;

    topEmojis: string[] = [
        "🥇",
        "🥈",
        "🥉"
    ];

    colors: Map<string, ColorResolvable> = new Map([
        ["rating", "#BB2222"],
        ["ratingFFA", "#428ff4"],
        ["ratingTeamers", "#35f00f"],
        ["money", "#FFD500"],
        ["fame", "#FFD500"]
    ]);
}
