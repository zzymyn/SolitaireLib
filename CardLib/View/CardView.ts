import { Colour } from "../Model/Colour";
import { Rank } from "../Model/Rank";
import { Suit } from "../Model/Suit";
import { ITouchResponder } from "./ITouchResponder";
import { IView } from "./IView";
import { Rect } from "./Rect";
import { ViewContext } from "./ViewContext";
import { instantiateTemplate } from "./ViewUtils";

export class CardView implements IView, ITouchResponder {
    public readonly context: ViewContext;
    public readonly element: HTMLElement;
    public click = () => {};
    public dblClick = () => {};
    public dragStart = () => ({ canDrag: false, extraCardViews: [] as CardView[] });
    public dragMoved = (rect: Rect) => {};
    public dragEnd = (rect: Rect, cancelled: boolean) => {};

    private readonly rect_ = new Rect();
    public get rect() {
        const rect = new Rect();
        rect.set(this.rect_);
        return rect;
    }
    public set rect(rect: Rect) {
        if (this.rect_.set(rect)) {
            rect.setOnElement(this.element);
        }
    }

    private zIndex_ = 0;
    public get zIndex() {
        return this.zIndex_;
    }
    public set zIndex(zIndex: number) {
        if (this.zIndex_ === zIndex) return;
        this.zIndex_ = zIndex;
        this.element.style.zIndex = `${zIndex}`;
    }

    private faceUp_ = false;
    public get faceUp() {
        return this.faceUp_;
    }
    public set faceUp(faceUp: boolean) {
        if (this.faceUp_ === faceUp) return;
        this.faceUp_ = faceUp;
        if (faceUp) {
            this.element.classList.add("faceUp");
        } else {
            this.element.classList.remove("faceUp");
        }
    }

    private won_ = false;
    public get won() {
        return this.won_;
    }
    public set won(won: boolean) {
        if (this.won_ === won) return;
        this.won_ = won;
        if (won) {
            this.element.classList.add("won");
        } else {
            this.element.classList.remove("won");
        }
    }

    private dropPreview_ = false;
    public get dropPreview() {
        return this.dropPreview_;
    }
    public set dropPreview(dropPreview: boolean) {
        if (this.dropPreview_ === dropPreview) return;
        this.dropPreview_ = dropPreview;
        if (dropPreview) {
            this.element.classList.add("dropPreview");
        } else {
            this.element.classList.remove("dropPreview");
        }
    }

    constructor(parent: IView, suit: Suit, colour: Colour, rank: Rank) {
        this.context = parent.context;
        this.element = instantiateTemplate(parent.element, "cardViewTemplate");
        this.element.classList.add(`s${suit}c${colour}r${rank}`);
        this.element.addEventListener("mousedown", this.onMouseDown_);
        this.element.addEventListener("touchstart", this.touchStart_);
    }

    public dispose() {
        this.element.removeEventListener("mousedown", this.onMouseDown_);
        this.element.removeEventListener("touchstart", this.touchStart_);
        this.element.remove();
    }

    private touchTracking_ = false;
    private touchId_ = 0;
    private touchInDeadZone_ = false;
    private touchStartX_ = 0;
    private touchStartY_ = 0;
    private lastTouchEndTimeStamp_ = 0;

    public onTouchDown(id: number, x: number, y: number, timeStamp: number) {
        if (!this.touchTracking_) {
            this.touchId_ = id;
            this.touchTracking_ = true;
            this.touchInDeadZone_ = true;
            this.touchStartX_ = x;
            this.touchStartY_ = y;
            this.dragging_ = false;
        }
    }

    public onTouchMoved(id: number, x: number, y: number, timeStamp: number) {
        if (this.touchTracking_ && this.touchId_ === id) {
            let dx = x - this.touchStartX_;
            let dy = y - this.touchStartY_;

            if (this.touchInDeadZone_) {
                const dLenSq = dx * dx + dy * dy;
                if (dLenSq > ViewContext.TOUCH_DEADZONE_SQ) {
                    const dlen = Math.sqrt(dLenSq);
                    dx /= dlen;
                    dy /= dlen;
                    this.touchStartX_ += ViewContext.TOUCH_DEADZONE * dx;
                    this.touchStartY_ += ViewContext.TOUCH_DEADZONE * dy;
                    this.touchInDeadZone_ = false;
                    this.startDragging_();
                }
            }
            if (this.dragging_) {
                this.touchStartX_ = x;
                this.touchStartY_ = y;

                const pxSize = this.context.pxPerRem;

                this.dragRect_.x += pxSize * dx;
                this.dragRect_.y += pxSize * dy;
                this.dragRect_.setOnElement(this.element);

                for (const dragExtraCardView of this.dragExtraCardViews_) {
                    dragExtraCardView.dragRect_.x += pxSize * dx;
                    dragExtraCardView.dragRect_.y += pxSize * dy;
                    dragExtraCardView.dragRect_.setOnElement(dragExtraCardView.element);
                }

                this.dragMoved(this.dragRect_);
            }
        }
    }

    public onTouchUp(id: number, cancelled: boolean, timeStamp: number) {
        if (this.touchTracking_ && this.touchId_ === id) {
            this.touchTracking_ = false;

            this.context.removeTouchResponder(this);

            if (this.touchInDeadZone_) {
                if (timeStamp < this.lastTouchEndTimeStamp_ + 1000) {
                    this.dblClick();
                } else {
                    this.lastTouchEndTimeStamp_ = timeStamp;
                    this.click();
                }
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
            this.element.classList.add("dragging");

            for (const dragExtraCardView of this.dragExtraCardViews_) {
                dragExtraCardView.dragRect_.set(dragExtraCardView.rect_);
                dragExtraCardView.element.classList.add("dragging");
            }
        }
    }

    private stopDragging_(cancelled: boolean) {
        if (this.dragging_) {
            this.dragging_ = false;

            this.element.classList.remove("dragging");
            this.rect_.setOnElement(this.element);

            for (const dragExtraCardView of this.dragExtraCardViews_) {
                dragExtraCardView.element.classList.remove("dragging");
                dragExtraCardView.rect_.setOnElement(dragExtraCardView.element);
            }

            this.dragEnd(this.dragRect_, cancelled);
        }
    }

    private readonly onMouseDown_ = (e: MouseEvent) => {
        if (e.button === 0) {
            e.preventDefault();
            this.context.addTouchResponder(this);
            this.onTouchDown(-1, e.pageX, e.pageY, e.timeStamp);
        }
    };

    private readonly touchStart_ = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; ++i) {
            const touch = e.changedTouches.item(i);
            if (touch) {
                e.preventDefault();
                this.context.addTouchResponder(this);
                this.onTouchDown(touch.identifier, touch.pageX, touch.pageY, e.timeStamp);
            }
        }
    };
}
