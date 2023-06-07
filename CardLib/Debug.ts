export function assert(condition: boolean, message?: string) {
    if (!condition) {
        error(message);
    }
}

export function error(message?: string): never {
    message = message ?? "Assert failed";
    throw new Error(message);
}
