import { GameSerializationContext } from "../GameSerializationContext";

export interface IUndoableOperationStatic {
    deserialize(context: GameSerializationContext): IUndoableOperation;
}

export interface IUndoableOperation {
    undo(): void;
    redo(): void;
    serialize(context: GameSerializationContext): void;
}