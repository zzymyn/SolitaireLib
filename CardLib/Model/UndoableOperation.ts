export class UndoableOperation {
    private readonly redos_: (() => void)[] = [];
    private readonly undos_: (() => void)[] = [];

    public get length() { return this.undos_.length; }

    public addOperation(redo: () => void, undo: () => void) {
        this.redos_.push(redo);
        this.undos_.push(undo);
    }

    public undo() {
        for (let i = this.undos_.length; i-- > 0;) {
            this.undos_[i]();
        }
    }

    public redo() {
        for (const redo of this.redos_) {
            redo();
        }
    }
}