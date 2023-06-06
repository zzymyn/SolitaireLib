export class Rect {
    constructor(public sizeX = 0, public sizeY = 0, public x = 0, public y = 0) {}

    public get xMin() {
        return this.x - 0.5 * this.sizeX;
    }

    public set xMin(xMin: number) {
        const xMax = this.xMax;
        this.sizeX = xMax - xMin;
        this.x = 0.5 * xMin + 0.5 * xMax;
    }

    public get xMax() {
        return this.x + 0.5 * this.sizeX;
    }

    public set xMax(xMax: number) {
        const xMin = this.xMin;
        this.sizeX = xMax - xMin;
        this.x = 0.5 * xMin + 0.5 * xMax;
    }

    public get yMin() {
        return this.y - 0.5 * this.sizeY;
    }

    public set yMin(yMin: number) {
        const yMax = this.yMax;
        this.sizeX = yMax - yMin;
        this.y = 0.5 * yMin + 0.5 * yMax;
    }

    public get yMax() {
        return this.y + 0.5 * this.sizeY;
    }

    public set yMax(yMax: number) {
        const yMin = this.yMin;
        this.sizeX = yMax - yMin;
        this.y = 0.5 * yMin + 0.5 * yMax;
    }

    public set(rect: Rect) {
        if (this.equals(rect)) return false;
        this.x = rect.x;
        this.y = rect.y;
        this.sizeX = rect.sizeX;
        this.sizeY = rect.sizeY;
        return true;
    }

    public setOnElement(e: HTMLElement) {
        e.style.left = `calc(50% + ${this.x - 0.5 * this.sizeX}em)`;
        e.style.right = `calc(50% + ${-this.x - 0.5 * this.sizeX}em)`;
        e.style.top = `calc(50% + ${this.y - 0.5 * this.sizeY}em)`;
        e.style.bottom = `calc(50% + ${-this.y - 0.5 * this.sizeY}em)`;
    }

    public equals(o: Rect) {
        return this.x === o.x && this.y === o.y && this.sizeX === o.sizeX && this.sizeY === o.sizeY;
    }

    public overlaps(o: Rect) {
        const overlapX = Math.min(this.xMax, o.xMax) - Math.max(this.xMin, o.xMin);
        if (overlapX <= 0) return 0;
        const overlapY = Math.min(this.yMax, o.yMax) - Math.max(this.yMin, o.yMin);
        if (overlapY <= 0) return 0;
        return overlapX * overlapY;
    }
}
