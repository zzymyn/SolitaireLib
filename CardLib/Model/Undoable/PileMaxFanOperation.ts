import { GameSerializationContext } from "../GameSerializationContext";
import { Pile } from "../Pile";
import { IUndoableOperation } from "./IUndoableOperation";

export class PileMaxFanOperation implements IUndoableOperation {
    public static deserializer = (context: GameSerializationContext) => PileMaxFanOperation.deserialize(context);

    constructor(
        private readonly pile_: Pile,
        private readonly oldMaxFan_: number,
        private readonly newMaxFan_: number
    ) {}

    public undo() {
        this.pile_.doSetMaxFan(this.oldMaxFan_);
    }

    public redo() {
        this.pile_.doSetMaxFan(this.newMaxFan_);
    }

    public serialize(context: GameSerializationContext) {
        context.writePile(this.pile_);
        context.write(this.oldMaxFan_);
        context.write(this.newMaxFan_);
    }

    public get deserializer() {
        return PileMaxFanOperation.deserializer;
    }

    private static deserialize(context: GameSerializationContext) {
        const pile = context.readPile();
        const oldMaxFan = context.read();
        const newMaxFan = context.read();
        return new PileMaxFanOperation(pile, oldMaxFan, newMaxFan);
    }
}
