export class TypeEx {
    public static ensureNumber(v: unknown) {
        if (typeof v !== "number") throw new Error("Value was not a number.");
        return v;
    }

    public static ensureString(v: unknown) {
        if (typeof v !== "string") throw new Error("Value was not a string.");
        return v;
    }

    public static ensureBoolean(v: unknown) {
        if (typeof v !== "boolean") throw new Error("Value was not a boolean.");
        return v;
    }

    public static ensureArray(v: unknown) {
        if (!(v instanceof Array)) throw new Error("Value was not an array.");
        return v;
    }
}
