import {HexColorString, MessageEmbed} from "discord.js";

function shuffle(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function randomInteger(max: number, min: number = 0) { return Math.round(min - 0.5 + Math.random()*(max - min)); } // Целые, [от min до max-1]
function componentToHex(value: number) {return ("0" + value.toString(16)).slice(-2);}
function getRandomHexBrightString(): HexColorString {
    let colors: number[] = shuffle([0, 255, randomInteger(256)]);
    return `#${componentToHex(colors[0]) + componentToHex(colors[1]) + componentToHex(colors[2])}`;
}

export function getEmbed_CatImage(catURL: string): MessageEmbed{
    let catEmojis = ["😼", "😹", "🙀", "😾", "😿", "😻", "😺", "😸", "😽", "🐱", "🐈"];
    return new MessageEmbed()
        .setColor(getRandomHexBrightString())
        .setTitle(`${catEmojis[randomInteger(catEmojis.length)]} Случайный кот!`)
        .setDescription("Какой же он милый!")
        .setImage(catURL);
}

export function getEmbed_DogImage(dogURL: string): MessageEmbed{
    let dogEmojis = ["🐶", "🦮", "🐕‍🦺", "🐕", "🐺"];
    return new MessageEmbed()
        .setColor(getRandomHexBrightString())
        .setTitle(`${dogEmojis[randomInteger(dogEmojis.length)]} Случайный пёс!`)
        .setDescription("Какой же он крутой!")
        .setImage(dogURL);
}
