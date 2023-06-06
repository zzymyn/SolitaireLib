export class MathEx {
    public static clamp(value: number, min: number, max: number) {
        if (value <= min) return min;
        if (value >= max) return max;
        return value;
    }

    public static clamp01(value: number) {
        if (value <= 0) return 0;
        if (value >= 1) return 1;
        return value;
    }

    public static inverseLerp(a: number, b: number, value: number) {
        if (a !== b) return MathEx.clamp01((value - a) / (b - a));
        else return 0;
    }

    public static lerp(a: number, b: number, t: number) {
        return a + (b - a) * MathEx.clamp01(t);
    }
}
