import { error } from "~CardLib/Debug";
import { GameSerializationContext } from "../GameSerializationContext";
import { IUndoableOperation } from "./IUndoableOperation";

export class CompoundUndoableOperation implements IUndoableOperation {
    public static deserializer = (context: GameSerializationContext) => CompoundUndoableOperation.deserialize(context);

    private readonly ops_: IUndoableOperation[] = [];

    public get length() {
        return this.ops_.length;
    }

    public addOperation(op: IUndoableOperation) {
        this.ops_.push(op);
    }

    public undo() {
        for (let i = this.ops_.length; i-- > 0; ) {
            const op = this.ops_[i] ?? error();
            op.undo();
        }
    }

    public redo() {
        for (const op of this.ops_) {
            op.redo();
        }
    }

    public serialize(context: GameSerializationContext) {
        context.write(this.ops_.length);
        for (const op of this.ops_) {
            context.writeUndoable(op);
        }
    }

    public get deserializer() {
        return CompoundUndoableOperation.deserializer;
    }

    private static deserialize(context: GameSerializationContext) {
        const result = new CompoundUndoableOperation();
        const len = context.read();
        for (let i = 0; i < len; ++i) {
            result.addOperation(context.readUndoable());
        }
        return result;
    }
}
