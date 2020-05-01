export abstract class GameOptionsBase {
    constructor(protected readonly params_: URLSearchParams) {
    }

    protected getNumber_(key: string, defaultValue: number) {
        const valueStr = this.params_.get(key);
        if (typeof valueStr !== "string" || valueStr === "")
            return defaultValue;
        const value = Number(valueStr);
        if (Number.isNaN(value))
            return defaultValue;
        return value;
    }

    protected getBool_(key: string, defaultValue: boolean) {
        const valueStr = this.params_.get(key);
        if (typeof valueStr !== "string")
            return defaultValue;
        if (valueStr === "")
            return true;
        if (this.params_.get(key))
            return true;
        return false;
    }
}