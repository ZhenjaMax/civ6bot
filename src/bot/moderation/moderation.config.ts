export class ModerationConfig{
    roleBanID: string = "700353744226746408";
    roleMuteVoiceID: string = "700355053269155963";
    roleMuteChatID: string = "700354723236282370";

    roleAdministratorID: string = "698297099367874620";
    roleModeratorID: string = "699003139105488936";
    roleSupportID: string = "803537817497501716";

    punishmentChannelID: string = "817162797594968094";

    banTierDays: number[] = [0, 1, 2, 3, 5, 7, 14, 28, 365]; // Прогрессивная шкала банов

    clearMax: number = 10;

    maxWeakPoints: number = 5;
}
