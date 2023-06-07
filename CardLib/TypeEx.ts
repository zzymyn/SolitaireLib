import { error } from "./Debug";

export function ensureNotUndefined<T>(val: T | undefined, message?: string): asserts val is T {
    if (!val) {
        error(message);
    }
}

export function ensureNumber(v: unknown): asserts v is number {
    if (typeof v !== "number") {
        error("Value was not a number.");
    }
}

export function ensureString(v: unknown): asserts v is string {
    if (typeof v !== "string") {
        error("Value was not a string.");
    }
}

export function ensureBoolean(v: unknown): asserts v is boolean {
    if (typeof v !== "boolean") {
        error("Value was not a boolean.");
    }
}

export function ensureArray(v: unknown): asserts v is unknown[] {
    if (!(v instanceof Array)) {
        error("Value was not an array.");
    }
}

export function ensureNumberArray(v: unknown): asserts v is number[] {
    ensureArray(v);
    for (const a of v) {
        ensureNumber(a);
    }
}
