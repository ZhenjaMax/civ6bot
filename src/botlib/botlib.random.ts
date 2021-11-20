import {HexColorString} from "discord.js";

export class BotlibRandom{
    static shuffle(array: any[]): any[] {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    private static componentToHex(value: number): string {
        return ("0" + value.toString(16)).slice(-2);
    }

    static getRandomHexBrightString(): HexColorString {
        let colors: number[] = this.shuffle([0, 255, Math.floor(Math.random()*256)]);
        return `#${this.componentToHex(colors[0]) + this.componentToHex(colors[1]) + this.componentToHex(colors[2])}`;
    }
}
