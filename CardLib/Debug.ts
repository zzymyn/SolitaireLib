export class Debug {
    public static assert(condition: boolean, message: string | null = null) {
        if (!condition) {
            Debug.error(message);
        }
    }

    public static error(message: string | null = null): never {
        message = message || "Assert failed";
        if (typeof Error) {
            throw new Error(message);
        }
        throw message;
    }
}