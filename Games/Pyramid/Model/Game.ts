import prand from "pure-rand";
import { error } from "~CardLib/Debug";
import { Card } from "~CardLib/Model/Card";
import * as DeckUtils from "~CardLib/Model/DeckUtils";
import { DelayHint } from "~CardLib/Model/DelayHint";
import { GameBase } from "~CardLib/Model/GameBase";
import { Pile } from "~CardLib/Model/Pile";
import { Rank } from "~CardLib/Model/Rank";
import { GameOptions } from "./GameOptions";
import { IGame } from "./IGame";

const PYRAMID_SIZE = 7;

export class Game extends GameBase implements IGame {
    public readonly options: GameOptions;
    public readonly stock = new Pile(this);
    public readonly waste = new Pile(this);
    public readonly foundation = new Pile(this);
    public readonly pyramid: Pile[][] = [];
    private readonly pyramidCoords_ = new Map<Pile, { x: number; y: number }>();
    private restocks_ = 0;

    constructor(options: GameOptions) {
        super();

        this.options = options;
        this.piles.push(this.stock);
        this.piles.push(this.waste);
        this.piles.push(this.foundation);

        for (let y = 0; y < PYRAMID_SIZE; ++y) {
            const row: Pile[] = [];
            this.pyramid.push(row);
            for (let x = 0; x <= y; ++x) {
                const pile = new Pile(this);
                row.push(pile);
                this.pyramidCoords_.set(pile, { x, y });
                this.piles.push(pile);
            }
        }

        this.cards = DeckUtils.createStandard52Deck(this.stock);
    }

    protected doGetWon_() {
        // won when pyramid is empty:
        let sum = 0;
        for (const row of this.pyramid) {
            for (const pile of row) {
                sum += pile.length;
            }
        }
        return sum === 0;
    }

    public get wonCards() {
        const wonCards: Card[] = [];
        for (const card of this.foundation) {
            wonCards.push(card);
        }
        wonCards.sort((a, b) => {
            return a.pileIndex - b.pileIndex;
        });
        return wonCards;
    }

    protected *restart_(rng: prand.RandomGenerator) {
        this.restocks_ = 0;

        // put all the cards face down back into the stock
        for (const card of this.stock) {
            card.faceUp = false;
        }

        for (let pileIndex = this.piles.length; pileIndex-- > 0; ) {
            const pile = this.piles[pileIndex] ?? error();
            if (pile === this.stock) continue;
            for (let cardIndex = pile.length; cardIndex-- > 0; ) {
                const card = pile.at(cardIndex);
                card.faceUp = false;
                this.stock.push(card);
            }
        }

        // sort then shuffle the stock:
        this.stock.sort();
        this.stock.shuffle(rng);

        // TODO: add an option to reorder stock so the pyramid is not obviously unwinnable
        // TODO(2): add an option to ensure the whole game is winnable

        yield DelayHint.Settle;

        for (const row of this.pyramid) {
            for (const pile of row) {
                const card = this.stock.peek();
                if (card) {
                    pile.push(card);
                    card.faceUp = true;
                    yield DelayHint.Quick;
                }
            }
        }

        yield* this.doAutoMoves_();
    }

    protected *cardPrimary_(card: Card) {
        // if the player clicks on an unblocked king, move it to the foundation:
        if (card.rank === Rank.King && this.isFree_(card)) {
            this.foundation.push(card);
            yield* this.doAutoMoves_();
            return;
        }

        // if the player clicks on the top card of the stock, move it to the waste and turn over a new card:
        if (this.stock.peek() === card) {
            if (!card.faceUp) {
                card.faceUp = true;
            } else {
                this.waste.push(card);
            }
            yield* this.doAutoMoves_();
            return;
        }
    }

    protected *cardSecondary_(card: Card) {}

    protected *pilePrimary_(pile: Pile) {
        // if the stock is exhausted and the player click on it, move all the cards from the waste back to the stock:
        if (
            pile === this.stock &&
            this.stock.length === 0 &&
            this.waste.length > 0 &&
            this.restocks_ < this.options.restocksAllowed
        ) {
            this.restocks_++;
            for (let i = this.waste.length; i-- > 0; ) {
                const card = this.waste.at(i);
                card.faceUp = false;
            }
            yield DelayHint.OneByOne;
            for (let i = this.waste.length; i-- > 0; ) {
                const card = this.waste.at(i);
                this.stock.push(card);
            }

            yield* this.doAutoMoves_();
            return;
        }
    }

    protected *pileSecondary_(pile: Pile) {}

    protected canDrag_(card: Card): { canDrag: boolean; extraCards: Card[] } {
        return {
            canDrag: this.isFree_(card),
            extraCards: [],
        };
    }

    protected previewDrop_(card: Card, pile: Pile): boolean {
        return this.is13Move_(card, pile);
    }

    protected *dropCard_(card: Card, pile: Pile) {
        if (this.is13Move_(card, pile)) {
            this.foundation.push(pile.peek() ?? error());
            this.foundation.push(card);
            yield* this.doAutoMoves_();
        }
    }

    private isFree_(card: Card) {
        if (!card.faceUp) return false;

        // the top of the stock and waste are free:
        if (this.stock.peek() === card) return true;
        if (this.waste.peek() === card) return true;

        const coords = this.pyramidCoords_.get(card.pile);
        if (coords) {
            const nextRow = this.pyramid[coords.y + 1];
            if (!nextRow) return true;
            const block0 = nextRow[coords.x] ?? error();
            const block1 = nextRow[coords.x + 1] ?? error();
            return block0.length === 0 && block1.length === 0;
        }

        return false;
    }

    private is13Move_(card: Card, pile: Pile) {
        if (card.pile === pile) return false;
        if (!this.isFree_(card)) return false;
        const otherCard = pile.peek();
        if (!otherCard) return false;
        if (!this.isFree_(otherCard)) return false;
        return this.getCardValue_(card) + this.getCardValue_(otherCard) === 13;
    }

    private getCardValue_(card: Card) {
        switch (card.rank) {
            case Rank.Ace:
                return 1;
            case Rank.Two:
                return 2;
            case Rank.Three:
                return 3;
            case Rank.Four:
                return 4;
            case Rank.Five:
                return 5;
            case Rank.Six:
                return 6;
            case Rank.Seven:
                return 7;
            case Rank.Eight:
                return 8;
            case Rank.Nine:
                return 9;
            case Rank.Ten:
                return 10;
            case Rank.Jack:
                return 11;
            case Rank.Queen:
                return 12;
            case Rank.King:
                return 13;
            default:
                return 0;
        }
    }

    private *doAutoMoves_() {
        mainLoop: while (true) {
            if (this.options.autoPlayKings) {
                {
                    const card = this.stock.peek();
                    if (card && this.isFree_(card) && this.getCardValue_(card) === 13) {
                        yield DelayHint.OneByOne;
                        this.foundation.push(card);
                        continue mainLoop;
                    }
                }
                {
                    const card = this.waste.peek();
                    if (card && this.isFree_(card) && this.getCardValue_(card) === 13) {
                        yield DelayHint.OneByOne;
                        this.foundation.push(card);
                        continue mainLoop;
                    }
                }
                for (const row of this.pyramid) {
                    for (const pile of row) {
                        const card = pile.peek();
                        if (card && this.isFree_(card) && this.getCardValue_(card) === 13) {
                            yield DelayHint.OneByOne;
                            this.foundation.push(card);
                            continue mainLoop;
                        }
                    }
                }
            }
            if (this.options.autoRevealStockTop) {
                const card = this.stock.peek();
                if (card && !card.faceUp) {
                    yield DelayHint.OneByOne;
                    card.faceUp = true;
                    continue mainLoop;
                }
            }
            break;
        }
    }
}
