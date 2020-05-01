import { Card } from "../Card";
import { Pile } from "../Pile";
import { IUndoableOperation } from "./IUndoableOperation";

export class PileInsertOperation implements IUndoableOperation {
    constructor(private readonly card_: Card, private readonly oldPile_: Pile, private readonly oldPileIndex_: number, private readonly newPile_: Pile, private readonly newPileIndex_: number) {
    }

    public undo() {
        this.oldPile_.doInsert(this.oldPileIndex_, this.card_);
    }

    public redo() {
        this.newPile_.doInsert(this.newPileIndex_, this.card_);
    }
}