import { IUndoableOperation } from "./IUndoableOperation";

export class CompoundUndoableOperation implements IUndoableOperation {
    private readonly ops_: IUndoableOperation[] = [];

    public get length() { return this.ops_.length; }

    public addOperation(op: IUndoableOperation) {
        this.ops_.push(op);
    }

    public undo() {
        for (let i = this.ops_.length; i-- > 0;) {
            this.ops_[i].undo();
        }
    }

    public redo() {
        for (const op of this.ops_) {
            op.redo();
        }
    }
}