import { Debug } from "../Debug";
import { DelayHint } from "../Model/DelayHint";
import { ICard } from "../Model/ICard";
import { IGameBase } from "../Model/IGameBase";
import { IPile } from "../Model/IPile";
import { CardView } from "../View/CardView";
import { IView } from "../View/IView";
import { PileView } from "../View/PileView";
import { Rect } from "../View/Rect";

type DropPreview = { dropPreview: boolean };
type ZIndexed = { zIndex: number };

export abstract class GamePresenterBase {
    protected readonly gameBase_: IGameBase;
    protected readonly rootView_: IView;

    constructor(game: IGameBase, rootView: IView) {
        this.gameBase_ = game;
        this.rootView_ = rootView;

        // TODO: make nicer:
        document.getElementById("newGameButton")?.addEventListener("click", () => {
            this.restart_();
        });
        document.getElementById("undoButton")?.addEventListener("click", () => {
            this.undo_();
        });
        document.getElementById("redoButton")?.addEventListener("click", () => {
            this.redo_();
        });

        window.addEventListener("resize", this.onWindowResize_);
        window.addEventListener("keydown", this.onWindowKeyDown_);

        this.restart_();
    }

    protected abstract onResize_(): void;

    private readonly pileViews_: PileView[] = [];
    private readonly pileToPileView_ = new Map<IPile, PileView>();
    private readonly pileViewtoPile_ = new Map<PileView, IPile>();

    protected createPileView_(pile: IPile) {
        const pileView = new PileView(this.rootView_);
        this.pileViews_.push(pileView);
        this.pileToPileView_.set(pile, pileView);
        this.pileViewtoPile_.set(pileView, pile);

        pile.cardsChanged = () => this.onPileCardsChanged_(pileView, pile);

        pileView.click = () => this.pilePrimary_(pile);
        pileView.dblClick = () => this.pileSecondary_(pile);

        return pileView;
    }

    protected getPile_(pileView: PileView) {
        const pile = this.pileViewtoPile_.get(pileView);
        if (!pile) Debug.error();
        return pile;
    }

    protected getPileView_(pile: IPile) {
        const pileView = this.pileToPileView_.get(pile);
        if (!pileView) Debug.error();
        return pileView;
    }

    private onPileCardsChanged_(pileView: PileView, pile: IPile) {
        this.relayoutPile_(pileView, pile);
    }

    protected relayoutPile_(pileView: PileView, pile: IPile) {
        pileView.cardCount = pile.length;

        // go top to bottom to set z-indicies:
        let zIndex: number | undefined;
        for (let i = pile.length; i-- > 0;) {
            const card = pile.at(i);
            const cardView = this.getCardView_(card);

            if (zIndex) {
                cardView.zIndex = --zIndex;
            } else {
                zIndex = cardView.zIndex;
            }
        }

        // go bottom to top to set positions:
        let dx0 = 0;
        let dy0 = 0;
        let dx1 = 0;
        let dy1 = 0;

        for (let i = 0; i < pile.length; ++i) {
            const card = pile.at(i);
            const cardView = this.getCardView_(card);

            const rect = pileView.rect;

            dx0 = dx1;
            dy0 = dy1;
            rect.x += dx1;
            rect.y += dy1;

            if (card.faceUp) {
                dx1 += pileView.fanXUp;
                dy1 += pileView.fanYUp;
            } else {
                dx1 += pileView.fanXDown;
                dy1 += pileView.fanYDown;
            }

            cardView.rect = rect;
        }

        let hitbox = pileView.rect;
        hitbox.x += 0.5 * dx0;
        hitbox.y += 0.5 * dy0;
        hitbox.sizeX += dx0;
        hitbox.sizeY += dy0;
        pileView.hitbox = hitbox;
    }

    private readonly cardViews_: CardView[] = [];
    private readonly cardToCardView_ = new Map<ICard, CardView>();
    private readonly cardViewtoCard_ = new Map<CardView, ICard>();

    protected createCardView_(card: ICard) {
        const cardView = new CardView(this.rootView_, card.suit, card.colour, card.rank);
        this.cardViews_.push(cardView);
        this.cardToCardView_.set(card, cardView);
        this.cardViewtoCard_.set(cardView, card);

        this.onCardPileChanged_(cardView, card);
        card.pileChanged = () => this.onCardPileChanged_(cardView, card);

        this.onCardPileIndexChanged_(cardView, card);
        card.pileIndexChanged = () => this.onCardPileIndexChanged_(cardView, card);

        this.onCardFaceUpChanged_(cardView, card);
        card.faceUpChanged = () => this.onCardFaceUpChanged_(cardView, card);

        cardView.click = () => this.cardPrimary_(card);
        cardView.dblClick = () => this.cardSecondary_(card);
        cardView.dragStart = () => this.cardDragStart_(cardView, card);
        cardView.dragMoved = rect => this.cardDragMoved_(cardView, card, rect);
        cardView.dragEnd = (rect, cancelled) => this.cardDragEnd_(cardView, card, rect, cancelled);

        return cardView;
    }

    protected getCard_(cardView: CardView) {
        const card = this.cardViewtoCard_.get(cardView);
        if (!card) Debug.error();
        return card;
    }

    protected getCardView_(card: ICard) {
        const cardView = this.cardToCardView_.get(card);
        if (!cardView) Debug.error();
        return cardView;
    }

    private onCardPileChanged_(cardView: CardView, card: ICard) {
        cardView.zIndex = this.getNextZIndex_();
    }

    private onCardPileIndexChanged_(cardView: CardView, card: ICard) {
    }

    private onCardFaceUpChanged_(cardView: CardView, card: ICard) {
        cardView.faceUp = card.faceUp;
    }

    private cardDragStart_(cardView: CardView, card: ICard) {
        const { canDrag, extraCards: extraCards } = this.gameBase_.canDrag(card);

        if (canDrag) {
            cardView.zIndex = this.getNextZIndex_();
        }

        const extraCardViews: CardView[] = [];
        for (const extraCard of extraCards) {
            const extraCardView = this.getCardView_(extraCard);
            extraCardViews.push(extraCardView);
            if (canDrag) {
                extraCardView.zIndex = this.getNextZIndex_();
            }
        }

        return { canDrag, extraCardViews };
    }

    private cardDragMoved_(cardView: CardView, card: ICard, rect: Rect) {
        const pile = this.getBestDragPile_(card, rect);
        if (pile) {
            const topCard = pile.peek();
            if (topCard) {
                const topCardView = this.getCardView_(topCard);
                this.setDropPreview_(topCardView);
                return;
            } else {
                const pileView = this.getPileView_(pile);
                this.setDropPreview_(pileView);
                return;
            }
        }

        this.setDropPreview_(undefined);
    }

    private cardDragEnd_(cardView: CardView, card: ICard, rect: Rect, cancelled: boolean) {
        if (!cancelled) {
            const bestPile = this.getBestDragPile_(card, rect);
            if (bestPile) {
                this.addOperation_(() => this.gameBase_.dropCard(card, bestPile!));
            }
        }
        this.setDropPreview_(undefined);
    }

    private getBestDragPile_(card: ICard, rect: Rect) {
        let bestPile: IPile | undefined;
        let bestPileOverlap = 0;

        for (const pileView of this.pileViews_) {
            const pile = this.getPile_(pileView);
            const pileHitbox = pileView.hitbox;
            const overlap = rect.overlaps(pileHitbox);
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

    private dropPreview_: DropPreview | undefined = undefined;
    private setDropPreview_(view: DropPreview | undefined) {
        if (view !== this.dropPreview_) {
            if (this.dropPreview_)
                this.dropPreview_.dropPreview = false;
            this.dropPreview_ = view;
            if (this.dropPreview_)
                this.dropPreview_.dropPreview = true;
        }
    }

    private nextZIndex_ = 1000;
    private readonly nextZIndexInc_ = 1;
    private getNextZIndex_() {
        const r = this.nextZIndex_;
        this.nextZIndex_ += this.nextZIndexInc_;
        return r;
    }

    private readonly onWindowResize_ = (e: UIEvent) => {
        this.onResize_();
    }

    private readonly onWindowKeyDown_ = (e: KeyboardEvent) => {
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
                this.restart_();
                e.stopPropagation();
                e.preventDefault();
            }
        }
    }

    private async undo_() {
        this.addOperation_(() => this.gameBase_.undo());
    }

    private async redo_() {
        this.addOperation_(() => this.gameBase_.redo());
    }

    private async restart_() {
        this.addOperation_(() => this.gameBase_.restart(Date.now()));
    }

    private async pilePrimary_(pile: IPile) {
        this.addOperation_(() => this.gameBase_.pilePrimary(pile));
    }

    private async pileSecondary_(pile: IPile) {
        this.addOperation_(() => this.gameBase_.pileSecondary(pile));
    }

    private async cardPrimary_(card: ICard) {
        this.addOperation_(() => this.gameBase_.cardPrimary(card));
    }

    private async cardSecondary_(card: ICard) {
        this.addOperation_(() => this.gameBase_.cardSecondary(card));
    }

    private readonly operations_: (() => Generator<DelayHint, void>)[] = [];
    private async addOperation_(operation: () => Generator<DelayHint, void>) {
        let waitCount = 0;
        if (this.operations_.length === 0) {
            // nothing else is already running, so start now:
            this.operations_.push(operation);

            while (this.operations_.length > 0) {
                const op = this.operations_[0];
                for (const delay of op()) {
                    await this.waitForDelay_(delay, waitCount++);
                }
                this.operations_.shift();
            }
        } else {
            // something else is already running, so add to the pending:
            this.operations_.push(operation);
        }
    }

    private async waitForDelay_(delay: DelayHint, waitCount: number) {
        // make delays slightly shorter as things go on:
        const speedUp = Math.pow(0.95, waitCount);

        switch (delay) {
            case DelayHint.None:
                return;
            case DelayHint.Quick:
                await new Promise(resolve => setTimeout(resolve, speedUp * 20));
                return;
            case DelayHint.OneByOne:
                await new Promise(resolve => setTimeout(resolve, speedUp * 200));
                return;
            case DelayHint.Settle:
                await new Promise(resolve => setTimeout(resolve, speedUp * 400));
                return;
        }
    }
}