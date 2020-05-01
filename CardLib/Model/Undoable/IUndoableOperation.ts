export interface IUndoableOperation {
    undo(): void;
    redo(): void;
}