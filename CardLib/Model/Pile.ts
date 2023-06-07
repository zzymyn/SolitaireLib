import prand from "pure-rand";
import * as Debug from "../Debug";
import { Card } from "./Card";
import { Colour } from "./Colour";
import { GameBase } from "./GameBase";
import { GameSerializationContext } from "./GameSerializationContext";
import { IPile } from "./IPile";
import { Rank } from "./Rank";
import { Suit } from "./Suit";
import { PileInsertOperation } from "./Undoable/PileInsertOperation";
import { PileMaxFanOperation } from "./Undoable/PileMaxFanOperation";

export class Pile implements IPile {
    public readonly game: GameBase;
    public cardsChanged = () => {};
    public maxFanChanged = () => {};
    private readonly cards_: Card[] = [];

    public get length() {
        return this.cards_.length;
    }

    private maxFan_ = 999;
    public get maxFan() {
        return this.maxFan_;
    }
    public set maxFan(maxFan: number) {
        maxFan = Math.max(0, maxFan);
        if (this.maxFan_ === maxFan) return;

        const oldMaxFan = this.maxFan_;
        const op = new PileMaxFanOperation(this, oldMaxFan, maxFan);
        this.game.addUndoableOperation(op);
        op.redo();
    }
    public doSetMaxFan(maxFan: number) {
        this.maxFan_ = maxFan;
        this.maxFanChanged();
    }

    constructor(game: GameBase) {
        this.game = game;
    }

    public *[Symbol.iterator]() {
        for (const card of this.cards_) {
            yield card;
        }
    }

    public createCard(suit: Suit, colour: Colour, rank: Rank) {
        const card = new Card(this.game, suit, colour, rank, this, this.length);
        this.cards_.push(card);
        this.cardsChanged();
        return card;
    }

    public at(i: number) {
        const card = this.cards_[i] ?? Debug.error();
        Debug.assert(card.pile === this);
        return card;
    }

    public slice(start?: number, end?: number) {
        return this.cards_.slice(start, end);
    }

    public indexOf(card: Card) {
        return this.cards_.indexOf(card);
    }

    public sort() {
        this.cards_.sort((a, b) => {
            if (a.suit < b.suit) return -1;
            if (a.suit > b.suit) return 1;
            if (a.colour < b.colour) return -1;
            if (a.colour > b.colour) return 1;
            if (a.rank < b.rank) return -1;
            if (a.rank > b.rank) return 1;
            return 0;
        });

        for (let i = 0; i < this.cards_.length; ++i) {
            const card = this.cards_[i] ?? Debug.error();
            card.onPileIndexChanged(i);
        }

        this.cardsChanged();
    }

    public shuffle(rng: prand.RandomGenerator) {
        for (let i = 0; i < this.cards_.length; ++i) {
            let swapIndex: number;
            [swapIndex, rng] = prand.uniformIntDistribution(i, this.cards_.length - 1, rng);
            const tmp = this.cards_[i] ?? Debug.error();
            this.cards_[i] = this.cards_[swapIndex] ?? Debug.error();
            this.cards_[swapIndex] = tmp;
        }

        for (let i = 0; i < this.cards_.length; ++i) {
            const card = this.cards_[i] ?? Debug.error();
            card.onPileIndexChanged(i);
        }

        this.cardsChanged();
    }

    public sortByRank() {
        this.cards_.sort((a, b) => {
            if (a.rank > b.rank) return -1;
            if (a.rank < b.rank) return 1;
            if (a.colour < b.colour) return -1;
            if (a.colour > b.colour) return 1;
            if (a.suit < b.suit) return -1;
            if (a.suit > b.suit) return 1;
            return 0;
        });

        for (let i = 0; i < this.cards_.length; ++i) {
            const card = this.cards_[i] ?? Debug.error();
            card.onPileIndexChanged(i);
        }

        this.cardsChanged();
    }

    public push(card: Card) {
        return this.insert(this.cards_.length, card);
    }

    public peek() {
        if (this.cards_.length <= 0) return undefined;
        return this.at(this.cards_.length - 1);
    }

    public insert(index: number, card: Card) {
        const oldPile = card.pile;
        const oldIndex = card.pileIndex;
        const op = new PileInsertOperation(card, oldPile, oldIndex, this, index);
        this.game.addUndoableOperation(op);
        op.redo();
    }

    public doInsert(index: number, card: Card) {
        Debug.assert(index >= 0 && index <= this.cards_.length);

        if (card.pile === this && index > card.pileIndex) index--;

        card.pile.remove_(card);

        this.cards_.splice(index, 0, card);

        card.onPileChanged(this, index);
        for (let i = index + 1; i < this.cards_.length; ++i) {
            const card = this.cards_[i] ?? Debug.error();
            card.onPileIndexChanged(i);
        }
        this.cardsChanged();

        return card;
    }

    private remove_(card: Card) {
        Debug.assert(card.pile === this);

        const index = card.pileIndex;

        Debug.assert(this.at(index) === card);

        this.cards_.splice(index, 1);

        for (let i = index; i < this.cards_.length; ++i) {
            const card = this.cards_[i] ?? Debug.error();
            card.onPileIndexChanged(i);
        }
        this.cardsChanged();

        return card;
    }

    public serializeState(context: GameSerializationContext) {
        context.write(this.maxFan);
        context.write(this.cards_.length);
        for (const card of this.cards_) {
            context.write(context.getCardId(card));
        }
    }

    public deserializeState(context: GameSerializationContext) {
        this.maxFan = context.readRange(0, 999);
        const len = context.readRange(0, 999);
        for (let i = 0; i < len; ++i) {
            const card = context.getCard(context.read());
            this.insert(i, card);
        }
    }
}
