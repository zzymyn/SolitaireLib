export interface ITouchResponder {
    onTouchMoved(id: number, x: number, y: number): void;
    onTouchUp(id: number, cancelled: boolean): void;
}