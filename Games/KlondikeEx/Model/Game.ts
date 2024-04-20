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
    public readonly foundations: Pile[] = [];
    public readonly tableaux: Pile[] = [];
    private readonly dragSingleSources_: Pile[] = [];
    private readonly dragAnySources_: Pile[] = [];
    private readonly autoMoveSources_: Pile[] = [];
    private readonly autoMoveAnySources_: Pile[] = [];
    private restocks_ = 0;

    constructor(options: GameOptions) {
        super();

        this.options = options;
        this.piles.push(this.stock);
        this.dragAnySources_.push(this.stock);
        this.autoMoveAnySources_.push(this.stock);

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
        this.stock.maxFan = 0;

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

        this.stock.sortByRank();

        for (let i = this.stock.length; i-- > 0; ) {
            const card = this.stock.at(i);
            card.faceUp = true;
        }

        this.stock.maxFan = 999;

        yield DelayHint.OneByOne;

        yield* this.doAutoMoves_();
    }

    protected *cardPrimary_(card: Card) {
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
        // or see if we can move it around the tabeaux somewhere:
        if (this.isFoundationDropSource_(card)) {
            for (const pile of this.foundations) {
                if (this.isFoundationDrop_(card, pile)) {
                    yield* this.doFoundationDrop_(card, pile);
                    yield* this.doAutoMoves_();
                    return;
                }
            }
        }
        if (this.isTableauxDropSource_(card)) {
            for (const pile of this.tableaux) {
                if (pile === card.pile) continue;
                if (this.isTableauxDrop_(card, pile)) {
                    yield* this.doTableauxDrop_(card, pile);
                    yield* this.doAutoMoves_();
                    return;
                }
            }
        }
        if (this.isTableauxSingleDropSource_(card)) {
            for (const pile of this.tableaux) {
                if (pile === card.pile) continue;
                if (this.isTableauxSingleDrop_(card, pile)) {
                    yield* this.doTableauxSingleDrop_(card, pile);
                    yield* this.doAutoMoves_();
                    return;
                }
            }
        }
    }

    protected *pilePrimary_(pile: Pile) {}

    protected *pileSecondary_(pile: Pile) {}

    protected canDrag_(card: Card): { canDrag: boolean; extraCards: Card[] } {
        if (this.isFoundationDropSource_(card)) {
            return { canDrag: true, extraCards: [] };
        } else if (this.isTableauxSingleDropSource_(card)) {
            return { canDrag: true, extraCards: [] };
        } else if (this.isTableauxDropSource_(card)) {
            return { canDrag: true, extraCards: card.pile.slice(card.pileIndex + 1) };
        }
        return { canDrag: false, extraCards: [] };
    }

    protected previewDrop_(card: Card, pile: Pile): boolean {
        return (
            this.isTableauxDrop_(card, pile) ||
            this.isFoundationDrop_(card, pile) ||
            this.isTableauxSingleDrop_(card, pile)
        );
    }

    protected *dropCard_(card: Card, pile: Pile): Generator<DelayHint, void> {
        if (this.isTableauxDrop_(card, pile)) {
            yield* this.doTableauxDrop_(card, pile);
            yield* this.doAutoMoves_();
        } else if (this.isFoundationDrop_(card, pile)) {
            yield* this.doFoundationDrop_(card, pile);
            yield* this.doAutoMoves_();
        } else if (this.isTableauxSingleDrop_(card, pile)) {
            yield* this.doTableauxSingleDrop_(card, pile);
            yield* this.doAutoMoves_();
        }
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
        if (this.tableaux.indexOf(card.pile) >= 0 && card.pile.peek()?.faceUp) {
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
        yield DelayHint.OneByOne;
    }

    private isTableauxSingleDrop_(card: Card, pile: Pile) {
        if (card.pile === pile) return false;
        if (!this.isTableauxSingleDropSource_(card)) return false;

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

    private isTableauxSingleDropSource_(card: Card) {
        return (
            (this.dragSingleSources_.indexOf(card.pile) >= 0 && card.pile.peek() === card && card.faceUp) ||
            (this.dragAnySources_.indexOf(card.pile) >= 0 && card.faceUp)
        );
    }

    private *doTableauxSingleDrop_(card: Card, pile: Pile) {
        pile.push(card);
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
        return (
            (this.dragSingleSources_.indexOf(card.pile) >= 0 && card.pile.peek() === card && card.faceUp) ||
            (this.dragAnySources_.indexOf(card.pile) >= 0 && card.faceUp)
        );
    }

    private *doFoundationDrop_(card: Card, pile: Pile) {
        pile.push(card);
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
                            if (this.previewDrop_(card, foundation)) {
                                yield* this.dropCard_(card, foundation);
                                continue mainLoop;
                            }
                        }
                    }
                }

                for (const pile of this.autoMoveAnySources_) {
                    for (let i = pile.length; i-- > 0; ) {
                        const card = pile.at(i);
                        if (this.getCardValue_(card) <= foundationMin + this.options.autoMoveToFoundation) {
                            for (const foundation of this.foundations) {
                                if (this.previewDrop_(card, foundation)) {
                                    yield* this.dropCard_(card, foundation);
                                    continue mainLoop;
                                }
                            }
                        }
                    }
                }
            }

            if (this.options.autoCollateKings) {
                const openTableaux = [];
                let nextAutoMoveValue = 0;

                for (const tableau of this.tableaux) {
                    if (tableau.length > 0) {
                        const bottomCard = tableau.at(0);
                        if (bottomCard && bottomCard.rank === Rank.King && bottomCard.faceUp) {
                            openTableaux.push(tableau);
                            nextAutoMoveValue = Math.max(nextAutoMoveValue, 13 - tableau.length);
                        }
                    }
                }

                for (const tableau of this.tableaux) {
                    if (openTableaux.length < 4 && tableau.length === 0) {
                        openTableaux.push(tableau);
                        nextAutoMoveValue = Math.max(nextAutoMoveValue, 13 - tableau.length);
                    }
                }

                if (openTableaux.length === 4 && nextAutoMoveValue >= 3) {
                    for (const pile of this.autoMoveSources_) {
                        if (openTableaux.indexOf(pile) >= 0) continue;

                        for (const card of pile) {
                            if (card.faceUp && this.getCardValue_(card) === nextAutoMoveValue) {
                                for (const openTableau of openTableaux) {
                                    if (this.previewDrop_(card, openTableau)) {
                                        yield* this.dropCard_(card, openTableau);
                                        continue mainLoop;
                                    }
                                }
                            }
                        }
                    }

                    for (const pile of this.autoMoveAnySources_) {
                        for (let i = pile.length; i-- > 0; ) {
                            const card = pile.at(i);

                            if (this.getCardValue_(card) === nextAutoMoveValue) {
                                for (const openTableau of openTableaux) {
                                    if (this.previewDrop_(card, openTableau)) {
                                        yield* this.dropCard_(card, openTableau);
                                        continue mainLoop;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            break;
        }
    }
}
