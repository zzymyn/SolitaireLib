import { DelayHint } from "~CardLib/Model/DelayHint";
import { ICard } from "~CardLib/Model/ICard";
import { IPile } from "~CardLib/Model/IPile";
import { Rect } from "~CardLib/View/Rect";
import { IGameBase } from "../Model/IGameBase";
import { CardView } from "../View/CardView";
import { PileView } from "../View/PileView";

type DropPreview = { dropPreview: boolean };

export abstract class GamePresenterBase {
    protected readonly gameBase_: IGameBase;
    protected readonly htmlRoot_: HTMLElement;
    private readonly operations_: (() => Generator<DelayHint, void>)[] = [];
    private readonly cardViews: CardView[] = [];
    private readonly cardToCardView_ = new Map<ICard, CardView>();
    private readonly cardViewtoCard_ = new Map<CardView, ICard>();
    private readonly pileViews: PileView[] = [];
    private readonly pileToPileView_ = new Map<IPile, PileView>();
    private readonly pileViewtoPile_ = new Map<PileView, IPile>();
    private dropPreview_: DropPreview | null = null;

    constructor(game: IGameBase, htmlRoot: HTMLElement) {
        this.gameBase_ = game;
        this.htmlRoot_ = htmlRoot;

        window.addEventListener("resize", e => this.onWindowResize(e));
        window.addEventListener("keydown", e => this.onWindowKeyDown(e));

        this.restart();
    }

    protected abstract onResize_(): void;

    protected createPileView(pile: IPile) {
        let pileView = new PileView(this.htmlRoot_);
        this.pileViews.push(pileView);
        this.pileToPileView_.set(pile, pileView);
        this.pileViewtoPile_.set(pileView, pile);

        pile.cardsChanged = () => this.onPileCardsChanged_(pileView, pile);

        pileView.click = () => this.pilePrimary_(pile);
        pileView.dblClick = () => this.pileSecondary_(pile);

        return pileView;
    }

    private onPileCardsChanged_(pileView: PileView, pile: IPile) {
        pileView.cardCount = pile.length;
    }

    protected createCardView(card: ICard) {
        let cardView = new CardView(this.htmlRoot_, card.suit, card.colour, card.rank);
        this.cardViews.push(cardView);
        this.cardToCardView_.set(card, cardView);
        this.cardViewtoCard_.set(cardView, card);

        this.onCardPileChanged(cardView, card);
        card.pileChanged = () => this.onCardPileChanged(cardView, card);

        this.onCardPileIndexChanged(cardView, card);
        card.pileIndexChanged = () => this.onCardPileIndexChanged(cardView, card);

        this.onCardFaceUpChanged(cardView, card);
        card.faceUpChanged = () => this.onCardFaceUpChanged(cardView, card);

        cardView.click = () => this.cardPrimary_(card);

        cardView.dblClick = () => this.cardSecondary_(card);

        cardView.dragStart = () => this.cardDragStart(cardView, card);

        cardView.dragMoved = (rect) => this.cardDragMoved(cardView, card, rect);

        cardView.dragEnd = (rect, cancelled) => this.cardDragEnd(cardView, card, rect, cancelled);

        return cardView;
    }

    private onCardPileChanged(cardView: CardView, card: ICard) {
        let pileView = this.pileToPileView_.get(card.pile);
        if (pileView) {
            var rect = pileView.rect;
            rect.x += pileView.fanX * card.pileIndex;
            rect.y += pileView.fanY * card.pileIndex;
            cardView.rect = rect;
            cardView.zIndex = this.getNextZIndex();
        } else {
            cardView.rect = new Rect();
            cardView.zIndex = 0;
        }
    }

    private onCardPileIndexChanged(cardView: CardView, card: ICard) {
        let pileView = this.pileToPileView_.get(card.pile);
        if (pileView) {
            var rect = pileView.rect;
            rect.x += pileView.fanX * card.pileIndex;
            rect.y += pileView.fanY * card.pileIndex;
            cardView.rect = rect;
            cardView.zIndex = pileView.zIndex + 1 + card.pileIndex;
        } else {
            cardView.rect = new Rect();
            cardView.zIndex = 0;
        }
    }

    private onCardFaceUpChanged(cardView: CardView, card: ICard) {
        cardView.faceUp = card.faceUp;
    }

    private cardDragStart(cardView: CardView, card: ICard) {
        let { canDrag, alsoDrag } = this.gameBase_.canDrag(card);

        if (canDrag) {
            cardView.zIndex = this.getNextZIndex();
        }

        let alsoDragViews: CardView[] = [];
        for (const card of alsoDrag) {
            let cardView = this.cardToCardView_.get(card);
            if (cardView) {
                alsoDragViews.push(cardView);
                if (canDrag) {
                    cardView.zIndex = this.getNextZIndex();
                }
            }
        }

        return { canDrag: canDrag, alsoDrag: alsoDragViews };
    }

    private cardDragMoved(cardView: CardView, card: ICard, rect: Rect) {
        let pile = this.getBestDragPile(card, rect);
        if (pile) {
            let card = pile.peek();
            if (card) {
                let cardView = this.cardToCardView_.get(card);
                if (cardView) {
                    this.setDropPreview_(cardView);
                    return;
                }
            } else {
                let pileView = this.pileToPileView_.get(pile);
                if (pileView) {
                    this.setDropPreview_(pileView);
                    return;
                }
            }
        }

        this.setDropPreview_(null);
    }

    private cardDragEnd(cardView: CardView, card: ICard, rect: Rect, cancelled: boolean) {
        if (!cancelled) {
            let bestPile = this.getBestDragPile(card, rect);
            if (bestPile) {
                this.runOperation_(() => this.gameBase_.dropCard(card, bestPile!));
            }
        }
        this.setDropPreview_(null);
    }

    private getBestDragPile(card: ICard, rect: Rect) {
        let bestPile: IPile | null = null;
        let bestPileOverlap = 0;

        for (const pileView of this.pileViews) {
            let pile = this.pileViewtoPile_.get(pileView);
            if (!pile)
                continue;

            let pileHitbox = pileView.hitbox;
            let overlap = rect.overlaps(pileHitbox);
            if (overlap <= 0)
                continue;

            if (!bestPile || bestPileOverlap < overlap) {
                if (this.gameBase_.previewDrop(card, pile)) {
                    bestPile = pile;
                    bestPileOverlap = overlap;
                }
            }
        }

        return bestPile;
    }

    private setDropPreview_(view: DropPreview | null) {
        if (view != this.dropPreview_) {
            if (this.dropPreview_)
                this.dropPreview_.dropPreview = false;
            this.dropPreview_ = view;
            if (this.dropPreview_)
                this.dropPreview_.dropPreview = true;
        }
    }

    private nextZIndex_ = 1000;
    private getNextZIndex() {
        return this.nextZIndex_++;
    }

    private onWindowResize(e: UIEvent) {
        this.onResize_();
    }

    private onWindowKeyDown(e: KeyboardEvent) {
        if (e) {
            if (e.key === "y" && e.ctrlKey) {
                this.redo_();
                e.stopPropagation();
                e.preventDefault();
            } else if (e.key === "z" && e.ctrlKey) {
                this.undo_();
                e.stopPropagation();
                e.preventDefault();
            } else if (e.key === "n") {
                this.restart();
                e.stopPropagation();
                e.preventDefault();
            }
        }
    }

    private async undo_() {
        this.runOperation_(() => this.gameBase_.undo());
    }

    private async redo_() {
        this.runOperation_(() => this.gameBase_.redo());
    }

    private async restart() {
        this.runOperation_(() => this.gameBase_.restart(Date.now()));
    }

    private async pilePrimary_(pile: IPile) {
        this.runOperation_(() => this.gameBase_.pilePrimary(pile));
    }

    private async pileSecondary_(pile: IPile) {
        this.runOperation_(() => this.gameBase_.pileSecondary(pile));
    }

    private async cardPrimary_(card: ICard) {
        this.runOperation_(() => this.gameBase_.cardPrimary(card));
    }

    private async cardSecondary_(card: ICard) {
        this.runOperation_(() => this.gameBase_.cardSecondary(card));
    }

    private async runOperation_(operation: () => Generator<DelayHint, void>) {
        if (this.operations_.length == 0) {
            // run now
            this.operations_.push(operation);

            while (this.operations_.length > 0) {
                let op = this.operations_[0];
                for (const delay of op()) {
                    await this.waitForDelay(delay);
                }
                this.operations_.shift();
            }
        } else {
            this.operations_.push(operation);
        }
    }

    private async waitForDelay(delay: DelayHint) {
        switch (delay) {
            case DelayHint.None:
                return;
            case DelayHint.Quick:
                await new Promise(resolve => setTimeout(resolve, 20));
                return;
            case DelayHint.OneByOne:
                await new Promise(resolve => setTimeout(resolve, 200));
                return;
            case DelayHint.Settle:
                await new Promise(resolve => setTimeout(resolve, 400));
                return;
        }
    }
}