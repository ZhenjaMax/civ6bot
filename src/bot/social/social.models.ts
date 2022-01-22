import {GuildMember, Message} from "discord.js";

export interface IProfileMessagePair{
    message: Message;
    member: GuildMember;
}
