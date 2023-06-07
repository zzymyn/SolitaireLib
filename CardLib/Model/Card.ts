import * as Debug from "../Debug";
import { Colour } from "./Colour";
import { GameBase } from "./GameBase";
import { GameSerializationContext } from "./GameSerializationContext";
import { ICard } from "./ICard";
import { Pile } from "./Pile";
import { Rank } from "./Rank";
import { Suit } from "./Suit";
import { CardFlipOperation } from "./Undoable/CardFlipOperation";

export class Card implements ICard {
    public readonly game: GameBase;
    public readonly suit: Suit;
    public readonly colour: Colour;
    public readonly rank: Rank;
    public pile: Pile;
    public pileIndex = 0;
    public pileChanged = () => {};
    public pileIndexChanged = () => {};
    public faceUpChanged = () => {};

    private faceUp_ = false;
    public get faceUp() {
        return this.faceUp_;
    }
    public set faceUp(faceUp: boolean) {
        if (this.faceUp_ === faceUp) return;

        const oldFaceUp = this.faceUp_;
        const op = new CardFlipOperation(this, oldFaceUp, faceUp);
        this.game.addUndoableOperation(op);
        op.redo();
    }
    public doSetFaceUp(faceUp: boolean) {
        this.faceUp_ = faceUp;
        this.faceUpChanged();
    }

    public constructor(game: GameBase, suit: Suit, colour: Colour, rank: Rank, pile: Pile, pileIndex: number) {
        this.game = game;
        this.suit = suit;
        this.colour = colour;
        this.rank = rank;
        this.pile = pile;
        this.pileIndex = pileIndex;
    }

    public onPileChanged(newPile: Pile, newPileIndex: number) {
        if (this.pile === newPile) {
            this.onPileIndexChanged(newPileIndex);
        } else {
            this.pile = newPile;
            this.pileIndex = newPileIndex;

            Debug.assert(this.pileIndex === this.pile.indexOf(this));

            this.pileChanged();
        }
    }

    public onPileIndexChanged(newPileIndex: number) {
        if (this.pileIndex === newPileIndex) return;
        this.pileIndex = newPileIndex;

        Debug.assert(this.pileIndex === this.pile.indexOf(this));

        this.pileIndexChanged();
    }

    public serializeState(context: GameSerializationContext) {
        context.write(this.faceUp ? 1 : 0);
    }

    public deserializeState(context: GameSerializationContext) {
        this.faceUp = context.readRange(0, 1) !== 0;
    }
}
