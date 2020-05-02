import { Card } from "../Card";
import { GameSerializationContext } from "../GameSerializationContext";
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

    public serialize(context: GameSerializationContext) {
        context.write(context.getUndoableDeserializerId(PileInsertOperation.deserialize));
        context.writeCard(this.card_);
        context.writePile(this.oldPile_);
        context.write(this.oldPileIndex_);
        context.writePile(this.newPile_);
        context.write(this.newPileIndex_);
    }

    public static deserialize(context: GameSerializationContext) {
        const card = context.readCard();
        const oldPile = context.readPile();
        const oldPileIndex = context.read();
        const newPile = context.readPile();
        const newPileIndex = context.read();
        return new PileInsertOperation(card, oldPile, oldPileIndex, newPile, newPileIndex);
    }
}