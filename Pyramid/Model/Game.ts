import prand from 'pure-rand';
import { Card } from '~CardLib/Model/Card';
import { DeckUtils } from '~CardLib/Model/DeckUtils';
import { DelayHint } from '~CardLib/Model/DelayHint';
import { GameBase } from '~CardLib/Model/GameBase';
import { Pile } from '~CardLib/Model/Pile';
import { Rank } from '~CardLib/Model/Rank';
import { GameOptions } from './GameOptions';
import { IGame } from './IGame';

const PYRAMID_SIZE = 7;

export class Game extends GameBase implements IGame {
    public readonly options: GameOptions;
    public readonly stock = new Pile(this);
    public readonly waste = new Pile(this);
    public readonly foundation = new Pile(this);
    public readonly pyramid: Pile[][] = [];
    private pyramidCoords = new Map<Pile, { x: number, y: number }>();
    private restocks = 0;

    constructor(options: GameOptions) {
        super();

        this.options = options;
        this.piles.push(this.stock);
        this.piles.push(this.waste);
        this.piles.push(this.foundation);

        for (let y = 0; y < PYRAMID_SIZE; ++y) {
            this.pyramid.push([]);
            for (let x = 0; x <= y; ++x) {
                const pile = new Pile(this);
                this.pyramid[y].push(pile);
                this.pyramidCoords.set(pile, { x, y });
                this.piles.push(pile);
            }
        }

        this.cards = DeckUtils.createStandard52Deck(this.stock);
    }

    public get won(): boolean { return false; }

    public get unwinnable(): boolean { return false; }

    protected *restart_(rng: prand.RandomGenerator) {
        this.restocks = 0;

        // put all the cards face down back into the stock
        for (const card of this.stock) {
            card.flip(false);
        }

        for (let pileIndex = this.piles.length; pileIndex-- > 0;) {
            const pile = this.piles[pileIndex];
            if (pile === this.stock)
                continue;
            for (let cardIndex = pile.length; cardIndex-- > 0;) {
                const card = pile.at(cardIndex);
                card.flip(false);
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
                    card.flip(true);
                    yield DelayHint.Quick;
                }
            }
        }

        yield* this.doAutoMoves();
    }

    protected *cardPrimary_(card: Card) {
        // if the player clicks on an unblocked king, move it to the foundation:
        if (card.rank == Rank.King && this.isFree(card)) {
            this.foundation.push(card);
            yield* this.doAutoMoves();
            return;
        }

        // if the player clicks on the top card of the stock, move it to the waste and turn over a new card:
        if (this.stock.peek() === card) {
            if (!card.faceUp) {
                card.flip(true);
            } else {
                this.waste.push(card);
            }
            yield* this.doAutoMoves();
            return;
        }
    }

    protected *cardSecondary_(card: Card) {
    }

    protected *pilePrimary_(pile: Pile) {
        // if the stock is exhausted and the player click on it, move all the cards from the waste back to the stock:
        if (pile === this.stock && this.stock.length === 0 && this.waste.length > 0 && this.restocks < this.options.restocksAllowed) {
            this.restocks++;
            for (let i = this.waste.length; i-- > 0;) {
                const card = this.waste.at(i);
                card.flip(false);
            }
            yield DelayHint.OneByOne;
            for (let i = this.waste.length; i-- > 0;) {
                const card = this.waste.at(i);
                this.stock.push(card);
            }

            yield* this.doAutoMoves();
            return;
        }
    }

    protected *pileSecondary_(pile: Pile) {
    }

    protected canDrag_(card: Card): { canDrag: boolean; alsoDrag: Card[]; } {
        return {
            canDrag: this.isFree(card),
            alsoDrag: []
        }
    }

    protected previewDrop_(card: Card, pile: Pile): boolean {
        return this.is13Move(card, pile);
    }

    protected *dropCard_(card: Card, pile: Pile) {
        if (this.is13Move(card, pile)) {
            this.foundation.push(pile.peek()!);
            this.foundation.push(card);
            yield* this.doAutoMoves();
        }
    }

    private isFree(card: Card) {
        if (!card.faceUp)
            return false;

        // the top of the stock and waste are free:
        if (this.stock.peek() === card)
            return true;
        if (this.waste.peek() === card)
            return true;

        if (card.pile) {
            const coords = this.pyramidCoords.get(card.pile);
            if (coords) {
                const nextRow = this.pyramid[coords.y + 1];
                if (!nextRow)
                    return true;
                const block0 = nextRow[coords.x];
                const block1 = nextRow[coords.x + 1];
                return block0.length == 0 && block1.length == 0;
            }
        }

        return false;
    }

    private is13Move(card: Card, pile: Pile) {
        if (card.pile === pile)
            return false;
        if (!this.isFree(card))
            return false;
        const otherCard = pile.peek();
        if (!otherCard)
            return false;
        if (!this.isFree(otherCard))
            return false;
        return this.getCardValue(card) + this.getCardValue(otherCard) == 13;
    }

    private getCardValue(card: Card) {
        switch (card.rank) {
            case Rank.Ace: return 1;
            case Rank.Two: return 2;
            case Rank.Three: return 3;
            case Rank.Four: return 4;
            case Rank.Five: return 5;
            case Rank.Six: return 6;
            case Rank.Seven: return 7;
            case Rank.Eight: return 8;
            case Rank.Nine: return 9;
            case Rank.Ten: return 10;
            case Rank.Jack: return 11;
            case Rank.Queen: return 12;
            case Rank.King: return 13;
            default:
                return 0;
        }
    }

    private *doAutoMoves() {
        mainLoop: while (true) {
            if (this.options.autoPlayKings) {
                {
                    const card = this.stock.peek();
                    if (card && this.isFree(card) && this.getCardValue(card) == 13) {
                        yield DelayHint.OneByOne;
                        this.foundation.push(card);
                        continue mainLoop;
                    }
                }
                {
                    const card = this.waste.peek();
                    if (card && this.isFree(card) && this.getCardValue(card) == 13) {
                        yield DelayHint.OneByOne;
                        this.foundation.push(card);
                        continue mainLoop;
                    }
                }
                for (const row of this.pyramid) {
                    for (const pile of row) {
                        const card = pile.peek();
                        if (card && this.isFree(card) && this.getCardValue(card) == 13) {
                            yield DelayHint.OneByOne;
                            this.foundation.push(card);
                            continue mainLoop;
                        }
                    }
                }
            }
            if (this.options.autoRevealStockTop) {
                const card = this.stock.peek();
                if (card && card.faceUp === false) {
                    yield DelayHint.OneByOne;
                    card.flip(true);
                    continue mainLoop;
                }
            }
            break;
        }
    }
}