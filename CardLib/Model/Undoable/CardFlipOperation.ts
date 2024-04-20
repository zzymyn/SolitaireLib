import { Card } from "../Card";
import { GameSerializationContext } from "../GameSerializationContext";
import { IUndoableOperation } from "./IUndoableOperation";

export class CardFlipOperation implements IUndoableOperation {
    public static deserializer = (context: GameSerializationContext) => CardFlipOperation.deserialize(context);

    constructor(
        private readonly card_: Card,
        private readonly oldFaceUp_: boolean,
        private readonly newFaceUp_: boolean
    ) {}

    public undo() {
        this.card_.doSetFaceUp(this.oldFaceUp_);
    }

    public redo() {
        this.card_.doSetFaceUp(this.newFaceUp_);
    }

    public serialize(context: GameSerializationContext) {
        context.writeCard(this.card_);
        context.writeBool(this.oldFaceUp_);
        context.writeBool(this.newFaceUp_);
    }

    public get deserializer() {
        return CardFlipOperation.deserializer;
    }

    private static deserialize(context: GameSerializationContext) {
        const card = context.readCard();
        const oldFaceUp = context.readBool();
        const newFaceUp = context.readBool();
        return new CardFlipOperation(card, oldFaceUp, newFaceUp);
    }
}
