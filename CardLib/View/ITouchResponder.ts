export interface ITouchResponder {
    onTouchMoved(id: number, x: number, y: number, timeStamp: number): void;
    onTouchUp(id: number, cancelled: boolean, timeStamp: number): void;
}
