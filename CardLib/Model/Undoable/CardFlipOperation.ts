import { Card } from "../Card";
import { IUndoableOperation } from "./IUndoableOperation";

export class CardFlipOperation implements IUndoableOperation {
    constructor(private readonly card_: Card, private readonly oldFaceUp_: boolean, private readonly newFaceUp_: boolean) {
    }

    public undo() {
        this.card_.doFlip(this.oldFaceUp_);
    }

    public redo() {
        this.card_.doFlip(this.newFaceUp_);
    }
}