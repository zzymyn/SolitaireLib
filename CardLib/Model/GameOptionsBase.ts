export class GameOptionsBase {
    constructor(protected readonly params_: URLSearchParams) {
    }

    protected getFloat_(key: string, defaultValue: number) {
        const valueStr = this.params_.get(key);
        if (valueStr === undefined || valueStr === null || valueStr === "")
            return defaultValue;
        const value = Number(valueStr);
        if (Number.isNaN(value))
            return defaultValue;
        return value;
    }

    protected getInt_(key: string, defaultValue: number) {
        const valueStr = this.params_.get(key);
        if (valueStr === undefined || valueStr === null || valueStr === "")
            return defaultValue;
        const value = Number(valueStr);
        if (Number.isNaN(value) || !Number.isInteger(value))
            return defaultValue;
        return value;
    }

    protected getBool_(key: string, defaultValue: boolean) {
        const valueStr = this.params_.get(key);
        if (valueStr === undefined || valueStr === null)
            return defaultValue;
        if (valueStr === "")
            return true;
        if (this.params_.get(key))
            return true;
        return false;
    }
}