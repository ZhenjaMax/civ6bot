// noinspection HttpUrlsUsage

import express from 'express';
import {IUserSteam, UserSteamService} from "../db/models/db.UserSteam";
const fetch = require('node-fetch');

const app = express();
app.get('/', async (request, response) => {
    try {
        const code = request.query.code as string;
        if (!code)
            return response.send("no data!");

        const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: process.env.BOT_CLIENT_ID as string,
                client_secret: process.env.BOT_SECRET as string,
                code,
                grant_type: 'authorization_code',
                redirect_uri: `http://${process.env.OAUTH2_IP}:${process.env.OAUTH2_PORT}`,
                scope: 'identify',
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        const oauthData = await oauthResult.json();

        const userRaw = await fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `${oauthData.token_type} ${oauthData.access_token}`,
            },
        });
        const userConnectionsRaw = await fetch('https://discord.com/api/users/@me/connections', {
            headers: {
                authorization: `${oauthData.token_type} ${oauthData.access_token}`,
            },
        })

        const userData = await userRaw.json();
        const userConnectionsData: any[] = await userConnectionsRaw.json();

        // Если нет, то будет ошибка, потому что всё в блоке try-catch
        let userSteamService: UserSteamService = new UserSteamService();
        let userSteam: IUserSteam = {id: userData.id, steamID: userConnectionsData.filter((x) => {return x.type == 'steam'})[0].id};

        if(await userSteamService.hasSteamID(userSteam.steamID))
            return response.send("error: steam_id already exists");

        if(await userSteamService.update(userSteam))
            return response.send(`status=updated\n user_id=${userSteam.id},\n steam_id=${userSteam.steamID}`);

        await userSteamService.create(userSteam.id, userSteam.steamID);
        return response.send(`status=success\n user_id=${userSteam.id},\n steam_id=${userSteam.steamID}`);
    } catch (e) {
        return response.send("error: no discord-steam connection");
    }
});

app.listen(process.env.OAUTH2_PORT, () => {
    console.log(`OAuth2 listening at http://${process.env.OAUTH2_IP}:${process.env.OAUTH2_PORT}`);
});
