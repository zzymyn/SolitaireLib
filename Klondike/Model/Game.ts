import prand from 'pure-rand';
import { Card } from '~CardLib/Model/Card';
import { DeckUtils } from '~CardLib/Model/DeckUtils';
import { DelayHint } from '~CardLib/Model/DelayHint';
import { GameBase } from '~CardLib/Model/GameBase';
import { Pile } from '~CardLib/Model/Pile';
import { Rank } from '~CardLib/Model/Rank';
import { GameOptions } from './GameOptions';
import { IGame } from './IGame';

const TABLEAUX_COUNT = 7;

export class Game extends GameBase implements IGame {
    public readonly options: GameOptions;
    public readonly stock = new Pile(this);
    public readonly waste = new Pile(this);
    public readonly foundations: Pile[] = [];
    public readonly tableaux: Pile[] = [];
    private restocks = 0;

    constructor(options: GameOptions) {
        super();

        this.options = options;
        this.piles.push(this.stock);
        this.piles.push(this.waste);
        for (let i = 0; i < 4; ++i) {
            const pile = new Pile(this);
            this.foundations.push(pile);
            this.piles.push(pile);
        }

        for (let i = 0; i < TABLEAUX_COUNT; ++i) {
            const pile = new Pile(this);
            this.tableaux.push(pile);
            this.piles.push(pile);
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

        for (let i = 0; i < this.tableaux.length; ++i) {
            const pile = this.tableaux[i];
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
        if (this.stock.peek() === card) {
            this.waste.push(card);
            card.flip(true);
            yield* this.doAutoMoves_();
            return;
        }
    }

    protected *cardSecondary_(card: Card) {
    }

    protected *pilePrimary_(pile: Pile) {
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
            yield DelayHint.OneByOne;
            yield* this.doAutoMoves_();
            return;
        }
    }

    protected *pileSecondary_(pile: Pile) {
    }

    protected canDrag_(card: Card): { canDrag: boolean; alsoDrag: Card[]; } {
        if (this.waste.peek() === card) {
            return { canDrag: true, alsoDrag: [] };
        }

        for (const pile of this.tableaux) {
            if (card.pile === pile && card.faceUp) {
                return { canDrag: true, alsoDrag: pile.slice(card.pileIndex + 1) };
            }
        }

        return { canDrag: false, alsoDrag: [] };
    }

    protected previewDrop_(card: Card, pile: Pile): boolean {
        return this.isTableauxDrop_(card, pile) || this.isFoundationDrop(card, pile);
    }

    protected *dropCard_(card: Card, pile: Pile) {
        if (this.isTableauxDrop_(card, pile)) {
            const cards = card.pile.slice(card.pileIndex);
            for (const card of cards) {
                pile.push(card);
            }
            yield* this.doAutoMoves_();
        } else if (this.isFoundationDrop(card, pile)) {
            pile.push(card);
            yield* this.doAutoMoves_();
        }
    }

    private isTableauxDrop_(card: Card, pile: Pile) {
        if (card.pile === pile)
            return false;

        if (this.tableaux.indexOf(pile) >= 0) {
            const topCard = pile.peek();

            if (topCard) {
                if (topCard.rank == this.getNextRank(card) && topCard.colour !== card.colour) {
                    return true;
                }
            } else {
                if (card.rank == Rank.King) {
                    return true;
                }
            }
        }

        return false;
    }

    private isFoundationDrop(card: Card, pile: Pile) {
        if (card.pile === pile)
            return false;

        if (this.foundations.indexOf(pile) >= 0) {
            const topCard = pile.peek();

            if (topCard) {
                if (this.getNextRank(topCard) == card.rank && topCard.suit === card.suit) {
                    return true;
                }
            } else {
                if (card.rank == Rank.Ace) {
                    return true;
                }
            }
        }

        return false;
    }

    private getNextRank(card: Card) {
        switch (card.rank) {
            case Rank.Ace: return Rank.Two;
            case Rank.Two: return Rank.Three;
            case Rank.Three: return Rank.Four;
            case Rank.Four: return Rank.Five;
            case Rank.Five: return Rank.Six;
            case Rank.Six: return Rank.Seven;
            case Rank.Seven: return Rank.Eight;
            case Rank.Eight: return Rank.Nine;
            case Rank.Nine: return Rank.Ten;
            case Rank.Ten: return Rank.Jack;
            case Rank.Jack: return Rank.Queen;
            case Rank.Queen: return Rank.King;
            case Rank.King: return Rank.None;
            default: return Rank.None;
        }
    }

    private *doAutoMoves_() {
        mainLoop: while (true) {
            for (const tableau of this.tableaux) {
                const card = tableau.peek();
                if (card && !card.faceUp) {
                    yield DelayHint.Quick;
                    card.flip(true);
                    continue mainLoop;
                }
            }
            break;
        }
    }
}