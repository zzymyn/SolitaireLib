import { Debug } from "../Debug";
import { Colour } from "./Colour";
import { GameBase } from "./GameBase";
import { ICard } from "./ICard";
import { Pile } from "./Pile";
import { Rank } from "./Rank";
import { Suit } from "./Suit";
import { CardFlipOperation } from "./Undoable/CardFlipOperation";

export class Card implements ICard {
    public readonly suit: Suit;
    public readonly colour: Colour;
    public readonly rank: Rank;
    public readonly game: GameBase;
    public pile: Pile;
    public pileIndex = 0;
    public faceUp = false;
    public pileChanged = () => { };
    public pileIndexChanged = () => { };
    public faceUpChanged = () => { };

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
        }
        else {
            this.pile = newPile;
            this.pileIndex = newPileIndex;

            if (this.pile) {
                Debug.assert(this.pileIndex === this.pile.indexOf(this));
            } else {
                Debug.assert(this.pileIndex === 0);
            }

            this.pileChanged();
        }
    }

    public onPileIndexChanged(newPileIndex: number) {
        if (this.pileIndex === newPileIndex)
            return;
        this.pileIndex = newPileIndex;

        if (this.pile) {
            Debug.assert(this.pileIndex === this.pile.indexOf(this));
        } else {
            Debug.assert(this.pileIndex === 0);
        }

        this.pileIndexChanged();
    }

    public flip(faceUp: boolean) {
        if (this.faceUp === faceUp)
            return;
        const oldFaceUp = this.faceUp;
        const op = new CardFlipOperation(this, oldFaceUp, faceUp);
        this.game.addUndoableOperation(op);
        op.redo();
    }

    public doFlip(faceUp: boolean) {
        this.faceUp = faceUp;
        this.faceUpChanged();
    }

    public getEmoji() {
        if (!this.faceUp)
            return "🂠";
        switch (this.suit) {
            case Suit.Spades:
                switch (this.rank) {
                    case Rank.Ace: return "🂡";
                    case Rank.Two: return "🂢";
                    case Rank.Three: return "🂣";
                    case Rank.Four: return "🂤";
                    case Rank.Five: return "🂥";
                    case Rank.Six: return "🂦";
                    case Rank.Seven: return "🂧";
                    case Rank.Eight: return "🂨";
                    case Rank.Nine: return "🂩";
                    case Rank.Ten: return "🂪";
                    case Rank.Jack: return "🂫";
                    case Rank.Queen: return "🂭";
                    case Rank.King: return "🂮";
                }
                break;
            case Suit.Hearts:
                switch (this.rank) {
                    case Rank.Ace: return "🂱";
                    case Rank.Two: return "🂲";
                    case Rank.Three: return "🂳";
                    case Rank.Four: return "🂴";
                    case Rank.Five: return "🂵";
                    case Rank.Six: return "🂶";
                    case Rank.Seven: return "🂷";
                    case Rank.Eight: return "🂸";
                    case Rank.Nine: return "🂹";
                    case Rank.Ten: return "🂺";
                    case Rank.Jack: return "🂻";
                    case Rank.Queen: return "🂽";
                    case Rank.King: return "🂾";
                }
                break;
            case Suit.Diamonds:
                switch (this.rank) {
                    case Rank.Ace: return "🃁";
                    case Rank.Two: return "🃂";
                    case Rank.Three: return "🃃";
                    case Rank.Four: return "🃄";
                    case Rank.Five: return "🃅";
                    case Rank.Six: return "🃆";
                    case Rank.Seven: return "🃇";
                    case Rank.Eight: return "🃈";
                    case Rank.Nine: return "🃉";
                    case Rank.Ten: return "🃊";
                    case Rank.Jack: return "🃋";
                    case Rank.Queen: return "🃍";
                    case Rank.King: return "🃎";
                }
                break;
            case Suit.Clubs:
                switch (this.rank) {
                    case Rank.Ace: return "🃑";
                    case Rank.Two: return "🃒";
                    case Rank.Three: return "🃓";
                    case Rank.Four: return "🃔";
                    case Rank.Five: return "🃕";
                    case Rank.Six: return "🃖";
                    case Rank.Seven: return "🃗";
                    case Rank.Eight: return "🃘";
                    case Rank.Nine: return "🃙";
                    case Rank.Ten: return "🃚";
                    case Rank.Jack: return "🃛";
                    case Rank.Queen: return "🃝";
                    case Rank.King: return "🃞";
                }
                break;
        }

        return "";
    }
}
