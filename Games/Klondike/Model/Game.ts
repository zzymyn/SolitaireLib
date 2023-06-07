import prand from "pure-rand";
import * as Debug from "~CardLib/Debug";
import { Card } from "~CardLib/Model/Card";
import * as DeckUtils from "~CardLib/Model/DeckUtils";
import { DelayHint } from "~CardLib/Model/DelayHint";
import { GameBase } from "~CardLib/Model/GameBase";
import { Pile } from "~CardLib/Model/Pile";
import { Rank } from "~CardLib/Model/Rank";
import { GameOptions } from "./GameOptions";
import { IGame } from "./IGame";

const TABLEAUX_COUNT = 7;

export class Game extends GameBase implements IGame {
    public readonly options: GameOptions;
    public readonly stock = new Pile(this);
    public readonly waste = new Pile(this);
    public readonly foundations: Pile[] = [];
    public readonly tableaux: Pile[] = [];
    private readonly dragSingleSources_: Pile[] = [];
    private readonly autoMoveSources_: Pile[] = [];
    private restocks_ = 0;

    constructor(options: GameOptions) {
        super();

        this.options = options;
        this.piles.push(this.stock);
        this.piles.push(this.waste);
        this.dragSingleSources_.push(this.waste);
        this.autoMoveSources_.push(this.waste);

        for (let i = 0; i < 4; ++i) {
            const pile = new Pile(this);
            this.foundations.push(pile);
            this.dragSingleSources_.push(pile);
            this.piles.push(pile);
        }

        for (let i = 0; i < TABLEAUX_COUNT; ++i) {
            const pile = new Pile(this);
            this.tableaux.push(pile);
            this.dragSingleSources_.push(pile);
            this.autoMoveSources_.push(pile);
            this.piles.push(pile);
        }

        this.cards = DeckUtils.createStandard52Deck(this.stock);
    }

    protected doGetWon_() {
        // won when all cards are in the foundation:
        let sum = 0;
        for (const pile of this.foundations) {
            sum += pile.length;
        }
        return sum === 52;
    }

    public get wonCards() {
        const wonCards: Card[] = [];
        for (const pile of this.foundations) {
            for (const card of pile) {
                wonCards.push(card);
            }
        }
        wonCards.sort((a, b) => {
            if (a.pileIndex > b.pileIndex) return 1;
            if (a.pileIndex < b.pileIndex) return -1;
            if (a.rank > b.rank) return 1;
            if (a.rank < b.rank) return -1;
            return 0;
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
            const pile = this.piles[pileIndex] ?? Debug.error();
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

        for (let i = 0; i < this.tableaux.length; ++i) {
            const pile = this.tableaux[i] ?? Debug.error();
            for (let j = 0; j <= i; ++j) {
                const card = this.stock.peek();
                if (card) {
                    pile.push(card);
                    yield DelayHint.Quick;
                }
            }
        }

        yield DelayHint.OneByOne;

        yield* this.doAutoMoves_();
    }

    protected *cardPrimary_(card: Card) {
        // if the player clicks on the top card of the stock, move it to the waste and turn over a new card:
        if (this.stock.peek() === card && this.canDrawFromStock_()) {
            yield* this.doDrawFromStock_();
            yield* this.doAutoMoves_();
            return;
        }

        // if the player clicks the top card on the tableaux, reveal it:
        if (this.tableaux.indexOf(card.pile)) {
            if (card.pile.peek() === card && !card.faceUp) {
                card.faceUp = true;
                yield DelayHint.OneByOne;
                yield* this.doAutoMoves_();
                return;
            }
        }
    }

    protected *cardSecondary_(card: Card) {
        // if the player double clicks a card, see if it can be auto-moved to the foundation:
        if (this.autoMoveSources_.indexOf(card.pile) >= 0) {
            for (const foundation of this.foundations) {
                if (this.isFoundationDrop_(card, foundation)) {
                    foundation.push(card);
                    yield DelayHint.OneByOne;
                    yield* this.doAutoMoves_();
                    return;
                }
            }
        }
    }

    protected *pilePrimary_(pile: Pile) {
        // if the player clicks the stock and it has been depleted, move the waste back to the stock:
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
            this.waste.maxFan = 0;
            yield DelayHint.OneByOne;
            for (let i = this.waste.length; i-- > 0; ) {
                const card = this.waste.at(i);
                this.stock.push(card);
            }
            yield DelayHint.OneByOne;
            yield* this.doAutoMoves_();
            return;
        }
    }

    protected *pileSecondary_(pile: Pile) {}

    protected canDrag_(card: Card): { canDrag: boolean; extraCards: Card[] } {
        if (this.isFoundationDropSource_(card)) {
            return { canDrag: true, extraCards: [] };
        } else if (this.isTableauxDropSource_(card)) {
            return { canDrag: true, extraCards: card.pile.slice(card.pileIndex + 1) };
        }
        return { canDrag: false, extraCards: [] };
    }

    protected previewDrop_(card: Card, pile: Pile): boolean {
        return this.isTableauxDrop_(card, pile) || this.isFoundationDrop_(card, pile);
    }

    protected *dropCard_(card: Card, pile: Pile) {
        if (this.isTableauxDrop_(card, pile)) {
            yield* this.doTableauxDrop_(card, pile);
            yield* this.doAutoMoves_();
        } else if (this.isFoundationDrop_(card, pile)) {
            yield* this.doFoundationDrop_(card, pile);
            yield* this.doAutoMoves_();
        }
    }

    private canDrawFromStock_() {
        return this.stock.length > 0;
    }

    private *doDrawFromStock_() {
        this.waste.maxFan = 0;

        for (let i = 0; i < this.options.stockDraws; ++i) {
            const card = this.stock.peek();
            if (card) {
                this.waste.push(card);
                this.waste.maxFan++;
                yield DelayHint.Quick;
                card.faceUp = true;
                if (i < this.options.stockDraws - 1) {
                    yield DelayHint.Quick;
                }
            }
        }

        yield DelayHint.OneByOne;
    }

    private isTableauxDrop_(card: Card, pile: Pile) {
        if (card.pile === pile) return false;
        if (!this.isTableauxDropSource_(card)) return false;

        if (this.tableaux.indexOf(pile) >= 0) {
            const topCard = pile.peek();

            if (topCard) {
                if (this.getCardValue_(topCard) === this.getCardValue_(card) + 1 && topCard.colour !== card.colour) {
                    return true;
                }
            } else {
                if (card.rank === Rank.King) {
                    return true;
                }
            }
        }

        return false;
    }

    private isTableauxDropSource_(card: Card) {
        if (this.dragSingleSources_.indexOf(card.pile) >= 0 && card.pile.peek() === card && card.faceUp) {
            return true;
        } else if (this.tableaux.indexOf(card.pile) >= 0 && card.pile.peek()?.faceUp) {
            for (let i = card.pile.length - 1; i-- > 0; ) {
                const card0 = card.pile.at(i);
                const card1 = card.pile.at(i + 1);
                if (
                    card0.faceUp &&
                    card1.faceUp &&
                    card0.colour !== card1.colour &&
                    this.getCardValue_(card1) === this.getCardValue_(card0) - 1
                ) {
                    if (card0 === card) {
                        return true;
                    }
                } else {
                    return false;
                }
            }
        }
        return false;
    }

    private *doTableauxDrop_(card: Card, pile: Pile) {
        const sourcePile = card.pile;
        const movingCards = card.pile.slice(card.pileIndex);
        for (const movingCard of movingCards) {
            pile.push(movingCard);
        }
        if (sourcePile === this.waste) {
            this.waste.maxFan--;
        }
        yield DelayHint.OneByOne;
    }

    private isFoundationDrop_(card: Card, pile: Pile) {
        if (card.pile === pile) return false;
        if (!this.isFoundationDropSource_(card)) return false;

        if (this.foundations.indexOf(pile) >= 0) {
            const topCard = pile.peek();

            if (topCard) {
                if (this.getCardValue_(topCard) + 1 === this.getCardValue_(card) && topCard.suit === card.suit) {
                    return true;
                }
            } else {
                if (card.rank === Rank.Ace) {
                    return true;
                }
            }
        }

        return false;
    }

    private isFoundationDropSource_(card: Card) {
        return this.dragSingleSources_.indexOf(card.pile) >= 0 && card.pile.peek() === card && card.faceUp;
    }

    private *doFoundationDrop_(card: Card, pile: Pile) {
        const sourcePile = card.pile;
        pile.push(card);
        if (sourcePile === this.waste) {
            this.waste.maxFan--;
        }
        yield DelayHint.OneByOne;
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
                Debug.error();
        }
    }

    private *doAutoMoves_() {
        mainLoop: while (true) {
            if (this.options.autoReveal) {
                for (const tableau of this.tableaux) {
                    const card = tableau.peek();
                    if (card && !card.faceUp) {
                        card.faceUp = true;
                        yield DelayHint.OneByOne;
                        continue mainLoop;
                    }
                }
            }

            if (this.options.autoMoveToFoundation > 0) {
                let foundationMin = 999;
                for (const pile of this.foundations) {
                    const card = pile.peek();
                    if (card) {
                        foundationMin = Math.min(foundationMin, this.getCardValue_(card));
                    } else {
                        foundationMin = Math.min(foundationMin, 0);
                    }
                }

                for (const pile of this.autoMoveSources_) {
                    const card = pile.peek();
                    if (card && this.getCardValue_(card) <= foundationMin + this.options.autoMoveToFoundation) {
                        for (const foundation of this.foundations) {
                            if (this.isFoundationDrop_(card, foundation)) {
                                yield* this.doFoundationDrop_(card, foundation);
                                continue mainLoop;
                            }
                        }
                    }
                }
            }

            if (this.options.autoPlayStock) {
                if (this.waste.length === 0 && this.canDrawFromStock_()) {
                    yield* this.doDrawFromStock_();
                    continue mainLoop;
                }
            }

            break;
        }
    }
}
