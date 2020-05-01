import { IUndoableOperation } from "./IUndoableOperation";

export class AdHocOperation implements IUndoableOperation {
    constructor(public readonly undo: () => { }, public readonly redo: () => { }) {
    }
}