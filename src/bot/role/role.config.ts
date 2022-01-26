import {MessageButtonStyleResolvable} from "discord.js";

export class RoleConfig{
    roleFFAPirateID: string = "820789027518021642";
    roleFFALicenseID: string = "935359125204926514";
    roleTeamersPirateID: string = "819672819990003754";
    roleTeamersLicenseID: string = "935359256855740508";
    roleTableTopID: string = "821871088412786688";
    roleDotaID: string = "845633047003922442";

    rolesID: string[] = [
        this.roleFFAPirateID,
        this.roleFFALicenseID,
        this.roleTeamersPirateID,
        this.roleTeamersLicenseID,
        this.roleTableTopID,
        this.roleDotaID
    ];

    rolesEmojis: string[] = [
        "🗿",
        "🗿",
        "🐲",
        "🐲",
        "🎲",
        "🤬"
    ];

    rolesStyle: MessageButtonStyleResolvable[] = [
        "PRIMARY",
        "PRIMARY",
        "SUCCESS",
        "SUCCESS",
        "SECONDARY",
        "DANGER"
    ];

    roleFFAPirateName: string = "🗿 FFA Pirate"
    roleFFALicenseName: string = "🗿 FFA License 👑";
    roleTeamersPirateName: string = "🐲 Teamers Pirate";
    roleTeamersLicenseName: string = "🐲 Teamers License 👑";
    roleTableTopName: string = "🎲 TableTop";
    roleDotaName: string = "🤬 Dota 2";

    rolesName: string[] = [
        this.roleFFAPirateName,
        this.roleFFALicenseName,
        this.roleTeamersPirateName,
        this.roleTeamersLicenseName,
        this.roleTableTopName,
        this.roleDotaName
    ];
}
