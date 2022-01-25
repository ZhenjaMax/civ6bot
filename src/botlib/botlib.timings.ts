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
        let timezoneDate: Date = new Date(date.getTime() + this.getTimeMs("h", this.timeDelta))
        return `${timezoneDate.getDate()} ${this.months[timezoneDate.getMonth()]} ${timezoneDate.getFullYear()} года, ${((timezoneDate.getHours())%24<10) ? "0" : ""}${timezoneDate.getHours()%24}:${(timezoneDate.getMinutes()<10) ? "0" : ""}${timezoneDate.getMinutes()} МСК`;
    }

    getTimeToNextDayString(): string{
        let currentDate: Date = new Date();
        let nextDate: Date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()+1, 0, 0, 0, 0);
        let deltaMin: number = Math.floor((nextDate.getTime() - currentDate.getTime())/this.getTimeMs("m", 1));
        return `${Math.floor(deltaMin/60)}:${deltaMin%60 < 10 ? "0" : ""}${deltaMin%60} ч`;
    }

    getDaysDifference(date: Date): number{
        let thisDate: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

        let tempDate: Date = new Date();
        let currentDate: Date = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(), 0, 0, 0, 0);

        return Math.floor((currentDate.getTime()-thisDate.getTime())/this.getTimeMs("d", 1));
    }

    getHoursDifference(date: Date): number{ return Math.floor((Date.now()-date.getTime())/this.getTimeMs("h", 1)) }

    getTimeToNextTimeString(date: Date): string{
        let deltaMin: number = Math.floor((date.getTime()-Date.now())/this.getTimeMs("m", 1));
        return `${Math.floor(deltaMin/60)}:${deltaMin%60 < 10 ? "0" : ""}${deltaMin%60} ч`;
    }

}
