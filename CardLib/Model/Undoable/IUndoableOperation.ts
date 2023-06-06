import { GameSerializationContext } from "../GameSerializationContext";

export interface IUndoableOperation {
    readonly deserializer: (context: GameSerializationContext) => IUndoableOperation;
    undo(): void;
    redo(): void;
    serialize(context: GameSerializationContext): void;
}
