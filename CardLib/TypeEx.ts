export class TypeEx {
    public static ensureNumber(v: any) {
        if (typeof v !== "number")
            throw new Error();
        return v;
    }

    public static ensureString(v: any) {
        if (typeof v !== "string")
            throw new Error();
        return v;
    }

    public static ensureBoolean(v: any) {
        if (typeof v !== "boolean")
            throw new Error();
        return v;
    }

    public static ensureArray(v: any) {
        if (!(v instanceof Array))
            throw new Error();
        return v;
    }
}