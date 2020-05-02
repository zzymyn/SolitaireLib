import { Card } from "../Card";
import { GameSerializationContext } from "../GameSerializationContext";
import { IUndoableOperation, IUndoableOperationStatic } from "./IUndoableOperation";

export class CardFlipOperation implements IUndoableOperation {
    constructor(private readonly card_: Card, private readonly oldFaceUp_: boolean, private readonly newFaceUp_: boolean) {
    }

    public undo() {
        this.card_.doSetFaceUp(this.oldFaceUp_);
    }

    public redo() {
        this.card_.doSetFaceUp(this.newFaceUp_);
    }

    public serialize(context: GameSerializationContext) {
        context.write(context.getUndoableDeserializerId(CardFlipOperation.deserialize));
        context.writeCard(this.card_);
        context.writeBool(this.oldFaceUp_);
        context.writeBool(this.newFaceUp_);
    }

    public static deserialize(context: GameSerializationContext) {
        const card = context.readCard();
        const oldFaceUp = context.readBool();
        const newFaceUp = context.readBool();
        return new CardFlipOperation(card, oldFaceUp, newFaceUp);
    }
}