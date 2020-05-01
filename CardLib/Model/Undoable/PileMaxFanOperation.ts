import { Card } from "../Card";
import { Pile } from "../Pile";
import { IUndoableOperation } from "./IUndoableOperation";

export class PileMaxFanOperation implements IUndoableOperation {
    constructor(private readonly pile_: Pile, private readonly oldMaxFan_: number, private readonly newMaxFan_: number) {
    }

    public undo() {
        this.pile_.doSetMaxFan(this.oldMaxFan_);
    }

    public redo() {
        this.pile_.doSetMaxFan(this.newMaxFan_);
    }
}