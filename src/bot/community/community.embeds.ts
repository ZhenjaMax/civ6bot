import {MessageEmbed} from "discord.js";
import {CommunityConfig} from "./community.config";

export class CommunityEmbeds{
    communityConfig: CommunityConfig = new CommunityConfig();

    scrap(): MessageEmbed {
        return new MessageEmbed()
            .setColor('#FF3D3D')
            .setTitle('📌 Краткое описание правил: скрап')
            .setDescription(this.communityConfig.scrap);
    }

    irrelevant(): MessageEmbed {
        return new MessageEmbed()
            .setColor('#FF3D3D')
            .setTitle('📌 Краткое описание правил: иррелевантность')
            .setDescription(this.communityConfig.irrelevant);
    }

    remap(): MessageEmbed {
        return new MessageEmbed()
            .setColor('#FF3D3D')
            .setTitle('📌 Краткое описание правил: ремап и авторемап')
            .setDescription(this.communityConfig.remap)
    }

    leave(): MessageEmbed{
        return new MessageEmbed()
            .setColor('#FF3D3D')
            .setTitle('📌 Краткое описание правил: лив')
            .setDescription(this.communityConfig.leave);
    }

    veto(): MessageEmbed{
        return new MessageEmbed()
            .setColor('#FF3D3D')
            .setTitle('📌 Краткое описание правил: право вето')
            .setDescription(this.communityConfig.veto);
    }

    tie(): MessageEmbed{
        return new MessageEmbed()
            .setColor('#FF3D3D')
            .setTitle('📌 Краткое описание правил: смена места и ничья')
            .setDescription(this.communityConfig.tie);
    }

    sub(): MessageEmbed{
        return new MessageEmbed()
            .setColor('#FF3D3D')
            .setTitle('📌 Краткое описание правил: замена')
            .setDescription(this.communityConfig.sub);
    }

    cc(): MessageEmbed{
        return new MessageEmbed()
            .setColor('#FF3D3D')
            .setTitle('📌 Краткое описание правил: СС')
            .setDescription(this.communityConfig.cc);
    }
}
