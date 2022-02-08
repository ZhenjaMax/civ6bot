import {IGuildConfig} from "../../db/models/db.GuildConfig";
import {MessageEmbed} from "discord.js";
import {SettingsConfig} from "./settings.config";

export class SettingsEmbeds{
    settingsConfig: SettingsConfig = new SettingsConfig();

    status(guildConfig: IGuildConfig): MessageEmbed{
        let msg: MessageEmbed = new MessageEmbed()
            .setColor("#999999")
            .setTitle("⚙️ Конфигурация бота");
        let value: string;

        value = `FFA минимум лидеров: ${guildConfig.draftFFACivilizationMin}
        FFA максимум лидеров: ${guildConfig.draftFFACivilizationMax}
        Взакрытую минимум лидеров: ${guildConfig.draftBlindCivilizationMin}
        Взакрытую максимум лидеров: ${guildConfig.draftBlindCivilizationMax}`;
        msg.addField(this.settingsConfig.settingTypesValue[0], value, false);

        value = `Канал для предложений: ${guildConfig.feedbackProposalChannelID ? `<#${guildConfig.feedbackProposalChannelID}>` : "нет"}
        Минимум часов разницы для отправки предложений: ${guildConfig.feedbackProposalHoursMin}`;
        msg.addField(this.settingsConfig.settingTypesValue[1], value, false);

        value = `Роль администратора: ${guildConfig.moderationAdministratorRoleID ? `<@!${guildConfig.moderationAdministratorRoleID}>` : "нет"}
        Роль модератора: ${guildConfig.moderationModeratorRoleID ? `<@!${guildConfig.moderationModeratorRoleID}>` : "нет"}
        Роль помощника: ${guildConfig.moderationSupportRoleID ? `<@!${guildConfig.moderationSupportRoleID}>` : "нет"}
        Роль забанненого: ${guildConfig.moderationRoleBanID ? `<@!${guildConfig.moderationRoleBanID}>` : "нет"}
        Роль мута (голосовые каналы): ${guildConfig.moderationMuteVoiceRoleID ? `<@!${guildConfig.moderationMuteVoiceRoleID}>` : "нет"}
        Роль мута (текстовые каналы): ${guildConfig.moderationMuteChatRoleID ? `<@!${guildConfig.moderationMuteChatRoleID}>` : "нет"}
        Канал для отчетов для модерации: ${guildConfig.moderationPunishmentChannelID ? `<#${guildConfig.moderationPunishmentChannelID}>` : "нет"}
        Максимум удаляемых сообщений для команды \"/clear\": ${guildConfig.moderationClearMax}
        Время банов по шкале уровней банов: ${guildConfig.moderationBanTier1}, ${guildConfig.moderationBanTier2}, ${guildConfig.moderationBanTier3}, ${guildConfig.moderationBanTier4}, ${guildConfig.moderationBanTier5}, ${guildConfig.moderationBanTier6}, ${guildConfig.moderationBanTier7}, ${guildConfig.moderationBanTier8}
        Максимум очков слабости: ${guildConfig.moderationWeakPointsMax}`;
        msg.addField(this.settingsConfig.settingTypesValue[2], value, false);

        let ratingValues: number[] = [
            guildConfig.ratingMinRole0,
            guildConfig.ratingMinRole1,
            guildConfig.ratingMinRole2,
            guildConfig.ratingMinRole3,
            guildConfig.ratingMinRole4,
            guildConfig.ratingMinRole5,
            guildConfig.ratingMinRole6,
            guildConfig.ratingMinRole7,
            guildConfig.ratingMinRole8,
        ];
        value = `Канал для подвержденных отчетов: ${guildConfig.ratingChannelID ? `<#${guildConfig.ratingChannelID}>` : "нет"}
        Канал для отчетов на проверку: ${guildConfig.ratingReportsChannelID ? `<#${guildConfig.ratingReportsChannelID}>` : "нет"}
        Значения (D, K) для рейтинга Эло: ${guildConfig.ratingD}, ${guildConfig.ratingK}
        Множитель денег для победы: ${guildConfig.ratingMultiplierMoney}
        Множитель рейтинга для победы: ${guildConfig.ratingMultiplierRating}
        Множитель денег для рейтинга: ${guildConfig.ratingBaseMoney}
        Рейтинговая роль #0: ${guildConfig.ratingRoleID0 ? `<@!${guildConfig.ratingRoleID0}>` : "нет"}
        Рейтинговая роль #1: ${guildConfig.ratingRoleID1 ? `<@!${guildConfig.ratingRoleID1}>` : "нет"}
        Рейтинговая роль #2: ${guildConfig.ratingRoleID2 ? `<@!${guildConfig.ratingRoleID2}>` : "нет"}
        Рейтинговая роль #3: ${guildConfig.ratingRoleID3 ? `<@!${guildConfig.ratingRoleID3}>` : "нет"}
        Рейтинговая роль #4: ${guildConfig.ratingRoleID4 ? `<@!${guildConfig.ratingRoleID4}>` : "нет"}
        Рейтинговая роль #5: ${guildConfig.ratingRoleID5 ? `<@!${guildConfig.ratingRoleID5}>` : "нет"}
        Рейтинговая роль #6: ${guildConfig.ratingRoleID6 ? `<@!${guildConfig.ratingRoleID6}>` : "нет"}
        Рейтинговая роль #7: ${guildConfig.ratingRoleID7 ? `<@!${guildConfig.ratingRoleID7}>` : "нет"}
        Рейтинговая роль #8: ${guildConfig.ratingRoleID8 ? `<@!${guildConfig.ratingRoleID8}>` : "нет"}
        Значения рейтинга для получения ролей: ${ratingValues.join(", ")}`;
        msg.addField(this.settingsConfig.settingTypesValue[3], value, false);

        value = `Лидеры, рейтинг: ${(guildConfig.leaderboardRatingChannelID && guildConfig.leaderboardRatingMessageID) ? `[ссылка](https://discord.com/channels/${guildConfig.guildID}/${guildConfig.leaderboardRatingChannelID}/${guildConfig.leaderboardRatingMessageID})` : "нет"}
        Лидеры, FFA: ${(guildConfig.leaderboardRatingFFAChannelID && guildConfig.leaderboardRatingFFAMessageID) ? `[ссылка](https://discord.com/channels/${guildConfig.guildID}/${guildConfig.leaderboardRatingFFAChannelID}/${guildConfig.leaderboardRatingFFAMessageID})` : "нет"}
        Лидеры, Teamers: ${(guildConfig.leaderboardRatingTeamersChannelID && guildConfig.leaderboardRatingTeamersMessageID) ? `[ссылка](https://discord.com/channels/${guildConfig.guildID}/${guildConfig.leaderboardRatingTeamersChannelID}/${guildConfig.leaderboardRatingTeamersMessageID})` : "нет"}
        Лидеры, слава: ${(guildConfig.leaderboardFameChannelID && guildConfig.leaderboardFameMessageID) ? `[ссылка](https://discord.com/channels/${guildConfig.guildID}/${guildConfig.leaderboardFameChannelID}/${guildConfig.leaderboardFameMessageID})` : "нет"}
        Лидеры, деньги: ${(guildConfig.leaderboardMoneyChannelID && guildConfig.leaderboardMoneyMessageID) ? `[ссылка](https://discord.com/channels/${guildConfig.guildID}/${guildConfig.leaderboardMoneyChannelID}/${guildConfig.leaderboardMoneyMessageID})` : "нет"}`;
        msg.addField(this.settingsConfig.settingTypesValue[4], value, false);

        value = `Множитель денег для бонуса: ${guildConfig.socialBaseMoney}
        Минимум славы для дизлайка: ${guildConfig.socialFameForDislike}`;
        msg.addField(this.settingsConfig.settingTypesValue[5], value, false);

        return msg;
    }

    command(command: "reset"|"setup", type: string): MessageEmbed{
        return new MessageEmbed()
            .setColor("#999999")
            .setTitle("⚙️ Конфигурация бота")
            .setDescription(`Вы уверены, что хотите **__${command == "reset" ? "сбросить" : "настроить заново"}__** конфигурацию категории **__${this.settingsConfig.settingTypesValue[this.settingsConfig.settingsTypes.indexOf(type)]}__** ?`);
    }

    resetConfirm(type: number): MessageEmbed{
        return new MessageEmbed()
            .setColor("#999999")
            .setTitle("⚙️ Конфигурация бота")
            .setDescription(`Настройки категории __**${this.settingsConfig.settingTypesValue[type]}**__ были успешно сброшены.`);
    }
}
