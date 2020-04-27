import { Colour } from "../Model/Colour";
import { Rank } from "../Model/Rank";
import { Suit } from "../Model/Suit";
import { TemplatedElementView } from "./TemplatedElementView";
import { Rect } from "./Rect";

const deadZoneSize = 5;

export class CardView extends TemplatedElementView {
    public click = () => { };
    public dblClick = () => { };
    public dragStart = () => { return { canDrag: false, alsoDrag: [] as CardView[] }; };
    public dragMoved = (rect: Rect) => { };
    public dragEnd = (rect: Rect, cancelled: boolean) => { };
    private mouseTracking_ = false;
    private mouseInDeadZone_ = false;
    private mouseStartX_ = 0;
    private mouseStartY_ = 0;
    private dragging_ = false;
    private alsoDragging_: CardView[] = [];
    private readonly dragRect_ = new Rect();

    private readonly rect_ = new Rect();
    public get rect() {
        return new Rect().set(this.rect_);
    }
    public set rect(rect: Rect) {
        this.stopMouseTracking_(true);
        this.rect_.set(rect);
        rect.setOnElement(this.element);
    }

    private zIndex_ = 0;
    public get zIndex() { return this.zIndex_; }
    public set zIndex(zIndex: number) {
        if (this.zIndex_ == zIndex)
            return;
        this.zIndex_ = zIndex;
        this.element.style.zIndex = `${zIndex}`;
    }

    private faceUp_ = false;
    public get faceUp() { return this.faceUp_; }
    public set faceUp(faceUp: boolean) {
        if (this.faceUp_ == faceUp)
            return;
        this.faceUp_ = faceUp;
        if (faceUp) {
            this.element.classList.add("faceUp");
        } else {
            this.element.classList.remove("faceUp");
        }
    }

    private dropPreview_ = false;
    public get dropPreview() { return this.dropPreview_; }
    public set dropPreview(dropPreview: boolean) {
        if (this.dropPreview_ == dropPreview)
            return;
        this.dropPreview_ = dropPreview;
        if (dropPreview) {
            this.element.classList.add("dropPreview");
        } else {
            this.element.classList.remove("dropPreview");
        }
    }

    constructor(parent: HTMLElement, suit: Suit, colour: Colour, rank: Rank) {
        super(parent, "cardTemplate");
        this.element.classList.add(`s${suit}c${colour}r${rank}`);
        this.element.addEventListener("dblclick", this.onDblClick);
        this.element.addEventListener("mousedown", this.onMouseDown_);
    }

    private onDblClick = (e: MouseEvent) => {
        this.dblClick();
    }

    private startMouseTracking_(x: number, y: number) {
        if (!this.mouseTracking_) {
            this.mouseTracking_ = true;
            window.addEventListener("mousemove", this.onWindowMouseMove_);
            window.addEventListener("mouseup", this.onWindowMouseUp_);
            this.mouseInDeadZone_ = true;
            this.mouseStartX_ = x;
            this.mouseStartY_ = y;
            this.dragging_ = false;
        }
    }

    private stopMouseTracking_(cancelled: boolean) {
        if (this.mouseTracking_) {
            this.mouseTracking_ = false;
            window.removeEventListener("mousemove", this.onWindowMouseMove_);
            window.removeEventListener("mouseup", this.onWindowMouseUp_);
            this.stopDragging_(cancelled);
        }
    }

    private startDragging_() {
        let { canDrag, alsoDrag } = this.dragStart();

        if (canDrag) {
            this.dragging_ = true;
            this.alsoDragging_ = alsoDrag;

            this.dragRect_.set(this.rect_);
            this.element.classList.add("dragging");

            for (const alsoDragView of this.alsoDragging_) {
                alsoDragView.dragRect_.set(alsoDragView.rect_);
                alsoDragView.element.classList.add("dragging");
            }
        }
    }

    private stopDragging_(cancelled: boolean) {
        if (this.dragging_) {
            this.dragging_ = false;

            this.element.classList.remove("dragging");
            this.rect_.setOnElement(this.element);

            for (const alsoDragView of this.alsoDragging_) {
                alsoDragView.element.classList.remove("dragging");
                alsoDragView.rect_.setOnElement(alsoDragView.element);
            }

            this.dragEnd(this.dragRect_, cancelled);
        }
    }

    private onMouseDown_ = (e: MouseEvent) => {
        if (e.button == 0) {
            e.preventDefault();
            this.startMouseTracking_(e.pageX, e.pageY);
        }
    }

    private onWindowMouseMove_ = (e: MouseEvent) => {
        if ((e.buttons & 1) == 0) {
            this.stopMouseTracking_(true);
            return;
        }

        let dx = e.pageX - this.mouseStartX_;
        let dy = e.pageY - this.mouseStartY_;

        if (this.mouseInDeadZone_) {
            let dLenSq = dx * dx + dy * dy;
            if (dLenSq > deadZoneSize * deadZoneSize) {
                let dlen = Math.sqrt(dLenSq);
                dx /= dlen;
                dy /= dlen;
                this.mouseStartX_ += deadZoneSize * dx;
                this.mouseStartY_ += deadZoneSize * dy;
                this.mouseInDeadZone_ = false;
                this.startDragging_();
            }
        }
        if (this.dragging_) {
            this.mouseStartX_ = e.pageX;
            this.mouseStartY_ = e.pageY;

            var style = getComputedStyle(document.body);
            var pxSize = 1.0 / parseFloat(style.fontSize);

            this.dragRect_.x += pxSize * dx;
            this.dragRect_.y += pxSize * dy;
            this.dragRect_.setOnElement(this.element);

            for (const alsoDragView of this.alsoDragging_) {
                alsoDragView.dragRect_.x += pxSize * dx;
                alsoDragView.dragRect_.y += pxSize * dy;
                alsoDragView.dragRect_.setOnElement(alsoDragView.element);
            }

            this.dragMoved(this.dragRect_);
        }
    }

    private onWindowMouseUp_ = (e: MouseEvent) => {
        if (this.mouseInDeadZone_) {
            this.click();
            this.stopMouseTracking_(true);
        } else {
            this.stopMouseTracking_(false);
        }
    }
}