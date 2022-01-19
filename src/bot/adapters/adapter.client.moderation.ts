import {GuildMember} from "discord.js";
import {ModerationService, punishmentSchedule} from "../moderation/moderation.service";

export class AdapterClientModeration{
    moderationService: ModerationService = ModerationService.Instance;

    async checkMember(member: GuildMember){await this.moderationService.checkMember(member)}

    async checkOnReady(){
        console.log("Check members on...");
        await punishmentSchedule();
        console.log("Checking members complete")
    }
}
