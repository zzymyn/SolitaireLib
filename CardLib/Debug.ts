export function assertNotUndefined<T>(val: T | undefined, message?: string): asserts val is T {
    if (!val) {
        error(message);
    }
}

export function assert(condition: boolean, message?: string) {
    if (!condition) {
        error(message);
    }
}

export function error(message?: string): never {
    message = message ?? "Assert failed";
    throw new Error(message);
}
