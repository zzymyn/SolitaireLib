export class GameOptionsBase {
    protected params_: URLSearchParams;

    constructor(params: URLSearchParams) {
        this.params_ = params;
    }

    protected getFloat_(key: string, defaultValue: number) {
        const value = Number(this.params_.get(key));
        if (Number.isNaN(value))
            return defaultValue;
        return value;
    }

    protected getInt_(key: string, defaultValue: number) {
        const value = Number(this.params_.get(key));
        if (Number.isNaN(value) || !Number.isInteger(value))
            return defaultValue;
        return value;
    }

    protected getBool_(key: string, defaultValue: boolean) {
        const value = this.params_.get(key);
        if (value === undefined || value === null)
            return defaultValue;
        if (value === "")
            return true;
        if (this.params_.get(key))
            return true;
        return false;
    }
}