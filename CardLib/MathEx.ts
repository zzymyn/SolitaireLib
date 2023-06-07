export function clamp(value: number, min: number, max: number) {
    if (value <= min) return min;
    if (value >= max) return max;
    return value;
}

export function clamp01(value: number) {
    if (value <= 0) return 0;
    if (value >= 1) return 1;
    return value;
}

export function inverseLerp(a: number, b: number, value: number) {
    if (a !== b) return clamp01((value - a) / (b - a));
    else return 0;
}

export function lerp(a: number, b: number, t: number) {
    return a + (b - a) * clamp01(t);
}
