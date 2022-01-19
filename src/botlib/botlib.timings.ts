export class BotlibTimings{
    timeDelta: number = 3;  // Часовой пояс МСК GMT+3
    months: string[] = [
        "января",
        "февраля",
        "марта",
        "апреля",
        "мая",
        "июня",
        "июля",
        "августа",
        "сентября",
        "октября",
        "ноября",
        "декабря"
    ];

    duration: Map<string, number> = new Map([
        ["s", 1000],
        ["m", 1000*60],
        ["h", 1000*60*60],
        ["d", 1000*60*60*24],
        ["y", 1000*60*60*24*365]
    ]);

    getTimeMs(timeType: string, timeAmount: number): number{
        let timeTypeUnit: number|undefined = this.duration.get(timeType);
        return (timeTypeUnit) ? timeTypeUnit*timeAmount : 0;
    }

    // Московское время в форме строки; исходный объект не изменяется
    // Почему-то не работает корректно
    getDateString(date: Date): string{
        //let timezoneDate: Date = new Date(date.getTime() + this.getTimeMs("h", this.timeDelta))
        //return `${timezoneDate.getDate()} ${this.months[timezoneDate.getMonth()]} ${timezoneDate.getFullYear()} года, ${((timezoneDate.getHours())%24<10) ? "0" : ""}${timezoneDate.getHours()%24}:${(timezoneDate.getMinutes()<10) ? "0" : ""}${timezoneDate.getMinutes()} МСК`;
        return `${date.getDate()} ${this.months[date.getMonth()]} ${date.getFullYear()} года, ${((date.getHours())%24<10) ? "0" : ""}${date.getHours()%24}:${(date.getMinutes()<10) ? "0" : ""}${date.getMinutes()} МСК`;
    }
}
