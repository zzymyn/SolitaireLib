export function getNumber(params: URLSearchParams, key: string, defaultValue: number) {
    const valueStr = params.get(key);
    if (typeof valueStr !== "string" || valueStr === "") return defaultValue;
    const value = Number(valueStr);
    if (Number.isNaN(value)) return defaultValue;
    return value;
}

export function setNumber(params: URLSearchParams, key: string, value: number, defaultValue: number) {
    if (value !== defaultValue) {
        params.set(key, value.toString());
    }
}

export function getBool(params: URLSearchParams, key: string, defaultValue: boolean) {
    const valueStr = params.get(key);
    if (typeof valueStr !== "string") return defaultValue;
    if (valueStr === "") return true;
    if (valueStr) return true;
    return false;
}

export function setBool(params: URLSearchParams, key: string, value: boolean, defaultValue: boolean) {
    if (value !== defaultValue) {
        params.set(key, (value ? 1 : 0).toString());
    }
}
