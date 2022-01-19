export class BaseService{
    protected normalize(inputValue: any): any{
        if(inputValue == undefined)
            return undefined;
        if(Array.isArray(inputValue)) {
            let returnValue: any = [];
            inputValue.forEach(function (x: any) {returnValue.push(x.dataValues)});
            return returnValue;
        } else
            return inputValue.dataValues;
    }
}
