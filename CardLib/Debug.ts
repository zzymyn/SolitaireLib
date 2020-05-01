export class Debug {
    public static assert(condition: boolean, message?: string) {
        if (!condition) {
            Debug.error(message);
        }
    }

    public static error(message?: string): never {
        message = message || "Assert failed";
        throw new Error(message);
    }
}