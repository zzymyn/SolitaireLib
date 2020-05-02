import { GameSerializationContext } from "../GameSerializationContext";
import { IUndoableOperation } from "./IUndoableOperation";

export class AdHocOperation implements IUndoableOperation {
    constructor(public readonly undo: () => { }, public readonly redo: () => { }) {
    }

    public serialize(context: GameSerializationContext) {
        throw new Error("AdHocOperation is not serializable.");
    }
}