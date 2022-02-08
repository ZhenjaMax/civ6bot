export class SettingsConfig{
    settingsTypes: string[] = [
        "draft",
        "feedback",
        "moderation",
        "rating",
        "leaderboard",
        "social"
    ];

    settingsSteps: number[] = [4, 2, 17, 25, 0, 2];

    settingTypesValue: string[] = [
        "🃏 Драфт",
        "📣 Фидбек",
        "🔨 Модерация",
        "📈 Рейтинг",
        "🏆 Таблица лидеров",
        "👤 Социальные"
    ];
}
