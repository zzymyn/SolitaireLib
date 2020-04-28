import { ITouchResponder } from "./ITouchResponder";
import { IView } from "./IView";
import { Rect } from "./Rect";
import { TemplatedElementView } from "./TemplatedElementView";
import { ViewContext } from "./ViewContext";

export class PileView extends TemplatedElementView implements ITouchResponder {
    public click = () => { };
    public dblClick = () => { };
    public fanX = 0;
    public fanY = 0;
    public cardCount = 0;

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

    public get hitbox() {
        const rect = new Rect();
        rect.set(this.rect_);
        const dx = Math.max(0, this.cardCount - 1) * this.fanX;
        const dy = Math.max(0, this.cardCount - 1) * this.fanY;
        rect.x += 0.5 * dx;
        rect.y += 0.5 * dy;
        rect.sizeX += dx;
        rect.sizeY += dy;
        return rect;
    }

    private zIndex_ = 0;
    public get zIndex() { return this.zIndex_; }
    public set zIndex(zIndex: number) {
        if (this.zIndex_ === zIndex)
            return;
        this.zIndex_ = zIndex;
        this.element.style.zIndex = `${zIndex}`;
    }

    private showFrame_ = false;
    public get showFrame() { return this.showFrame_; }
    public set showFrame(showFrame: boolean) {
        if (this.showFrame_ === showFrame)
            return;
        this.showFrame_ = showFrame;
        if (showFrame) {
            this.element.classList.add("showFrame");
        } else {
            this.element.classList.remove("showFrame");
        }
    }

    private dropPreview_ = false;
    public get dropPreview() { return this.dropPreview_; }
    public set dropPreview(dropPreview: boolean) {
        if (this.dropPreview_ === dropPreview)
            return;
        this.dropPreview_ = dropPreview;
        if (dropPreview) {
            this.element.classList.add("dropPreview");
        } else {
            this.element.classList.remove("dropPreview");
        }
    }

    constructor(parent: IView) {
        super(parent, "pileTemplate");
        this.element.addEventListener("mousedown", this.onMouseDown_);
        this.element.addEventListener("touchstart", this.touchStart_);
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
                }
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
                    this.click();
                }
            }

            this.lastTouchEndTimeStamp_ = timeStamp;
        }
    }

    private readonly onMouseDown_ = (e: MouseEvent) => {
        if (e.button === 0) {
            e.preventDefault();
            this.context.addTouchResponder(this);
            this.onTouchDown(-1, e.pageX, e.pageY, e.timeStamp);
        }
    }

    private readonly touchStart_ = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; ++i) {
            const touch = e.changedTouches.item(i);
            if (touch) {
                e.preventDefault();
                this.context.addTouchResponder(this);
                this.onTouchDown(touch.identifier, touch.pageX, touch.pageY, e.timeStamp);
            }
        }
    }
}