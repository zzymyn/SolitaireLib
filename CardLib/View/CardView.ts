import { Colour } from "../Model/Colour";
import { Rank } from "../Model/Rank";
import { Suit } from "../Model/Suit";
import { ITouchResponder } from "./ITouchResponder";
import { Rect } from "./Rect";
import { TemplatedElementView } from "./TemplatedElementView";
import { ViewContext } from "./ViewContext";

const deadZoneSize = 5;

export class CardView extends TemplatedElementView implements ITouchResponder {
    public click = () => { };
    public dblClick = () => { };
    public dragStart = () => ({ canDrag: false, extraCardViews: [] as CardView[] });
    public dragMoved = (rect: Rect) => { };
    public dragEnd = (rect: Rect, cancelled: boolean) => { };

    private readonly rect_ = new Rect();
    public get rect() {
        return new Rect().set(this.rect_);
    }
    public set rect(rect: Rect) {
        this.onTouchUp(this.touchId_, true);
        this.rect_.set(rect);
        rect.setOnElement(this.element_);
    }

    private zIndex_ = 0;
    public get zIndex() { return this.zIndex_; }
    public set zIndex(zIndex: number) {
        if (this.zIndex_ === zIndex)
            return;
        this.zIndex_ = zIndex;
        this.element_.style.zIndex = `${zIndex}`;
    }

    private faceUp_ = false;
    public get faceUp() { return this.faceUp_; }
    public set faceUp(faceUp: boolean) {
        if (this.faceUp_ === faceUp)
            return;
        this.faceUp_ = faceUp;
        if (faceUp) {
            this.element_.classList.add("faceUp");
        } else {
            this.element_.classList.remove("faceUp");
        }
    }

    private dropPreview_ = false;
    public get dropPreview() { return this.dropPreview_; }
    public set dropPreview(dropPreview: boolean) {
        if (this.dropPreview_ === dropPreview)
            return;
        this.dropPreview_ = dropPreview;
        if (dropPreview) {
            this.element_.classList.add("dropPreview");
        } else {
            this.element_.classList.remove("dropPreview");
        }
    }

    constructor(context: ViewContext, parent: HTMLElement, suit: Suit, colour: Colour, rank: Rank) {
        super(context, parent, "cardTemplate");
        this.element_.classList.add(`s${suit}c${colour}r${rank}`);
        this.element_.addEventListener("dblclick", this.onDblClick_);
        this.element_.addEventListener("mousedown", this.onMouseDown_);
        this.element_.addEventListener("touchstart", this.touchStart_);
    }

    private readonly onDblClick_ = (e: MouseEvent) => {
        this.dblClick();
    }

    private touchTracking_ = false;
    private touchId_ = 0;
    private touchInDeadZone_ = false;
    private touchStartX_ = 0;
    private touchStartY_ = 0;

    public onTouchDown(id: number, x: number, y: number) {
        if (!this.touchTracking_) {
            this.touchId_ = id;
            this.touchTracking_ = true;
            this.touchInDeadZone_ = true;
            this.touchStartX_ = x;
            this.touchStartY_ = y;
            this.dragging_ = false;
        }
    }

    public onTouchMoved(id: number, x: number, y: number) {
        if (this.touchTracking_ && this.touchId_ === id) {
            let dx = x - this.touchStartX_;
            let dy = y - this.touchStartY_;

            if (this.touchInDeadZone_) {
                const dLenSq = dx * dx + dy * dy;
                if (dLenSq > deadZoneSize * deadZoneSize) {
                    const dlen = Math.sqrt(dLenSq);
                    dx /= dlen;
                    dy /= dlen;
                    this.touchStartX_ += deadZoneSize * dx;
                    this.touchStartY_ += deadZoneSize * dy;
                    this.touchInDeadZone_ = false;
                    this.startDragging_();
                }
            }
            if (this.dragging_) {
                this.touchStartX_ = x;
                this.touchStartY_ = y;

                const pxSize = this.context_.pxPerRem;

                this.dragRect_.x += pxSize * dx;
                this.dragRect_.y += pxSize * dy;
                this.dragRect_.setOnElement(this.element_);

                for (const dragExtraCardView of this.dragExtraCardViews_) {
                    dragExtraCardView.dragRect_.x += pxSize * dx;
                    dragExtraCardView.dragRect_.y += pxSize * dy;
                    dragExtraCardView.dragRect_.setOnElement(dragExtraCardView.element_);
                }

                this.dragMoved(this.dragRect_);
            }
        }
    }

    public onTouchUp(id: number, cancelled: boolean) {
        if (this.touchTracking_ && this.touchId_ === id) {
            this.touchTracking_ = false;

            this.context_.removeTouchResponder(this);

            if (this.touchInDeadZone_) {
                this.click();
                this.stopDragging_(true);
            } else {
                this.stopDragging_(false);
            }
        }
    }

    private dragging_ = false;
    private dragExtraCardViews_: CardView[] = [];
    private readonly dragRect_ = new Rect();

    private startDragging_() {
        const { canDrag, extraCardViews } = this.dragStart();

        if (canDrag) {
            this.dragging_ = true;
            this.dragExtraCardViews_ = extraCardViews;

            this.dragRect_.set(this.rect_);
            this.element_.classList.add("dragging");

            for (const dragExtraCardView of this.dragExtraCardViews_) {
                dragExtraCardView.dragRect_.set(dragExtraCardView.rect_);
                dragExtraCardView.element_.classList.add("dragging");
            }
        }
    }

    private stopDragging_(cancelled: boolean) {
        if (this.dragging_) {
            this.dragging_ = false;

            this.element_.classList.remove("dragging");
            this.rect_.setOnElement(this.element_);

            for (const dragExtraCardView of this.dragExtraCardViews_) {
                dragExtraCardView.element_.classList.remove("dragging");
                dragExtraCardView.rect_.setOnElement(dragExtraCardView.element_);
            }

            this.dragEnd(this.dragRect_, cancelled);
        }
    }

    private readonly onMouseDown_ = (e: MouseEvent) => {
        if (e.button === 0) {
            e.preventDefault();
            this.context_.addTouchResponder(this);
            this.onTouchDown(-1, e.pageX, e.pageY);
        }
    }

    private readonly touchStart_ = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; ++i) {
            const touch = e.changedTouches.item(i);
            if (touch) {
                e.preventDefault();
                this.context_.addTouchResponder(this);
                this.onTouchDown(touch.identifier, touch.pageX, touch.pageY);
            }
        }
    }
}