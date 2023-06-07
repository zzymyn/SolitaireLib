import * as Debug from "~CardLib/Debug";
import { ITouchResponder } from "./ITouchResponder";

export class ViewContext {
    public static readonly TOUCH_DEADZONE = 5;
    public static readonly TOUCH_DEADZONE_SQ = 5 * 5;

    private readonly element_: HTMLElement;
    private readonly touchResponders_: ITouchResponder[] = [];

    private pxPerRem_ = 0;
    public get pxPerRem() {
        return this.pxPerRem_;
    }

    constructor(element: HTMLElement) {
        this.element_ = element;

        window.addEventListener("resize", this.onResize_);

        window.addEventListener("mousemove", this.onWindowMouseMove_);
        window.addEventListener("mouseup", this.onWindowMouseUp_);

        window.addEventListener("touchmove", this.onWindowTouchMove_);
        window.addEventListener("touchend", this.onWindowTouchEnd_);
        window.addEventListener("touchcancel", this.onWindowTouchCancel_);

        this.refreshUnits_();
    }

    private readonly onResize_ = () => {
        this.refreshUnits_();
    };

    private refreshUnits_() {
        const style = getComputedStyle(this.element_);
        this.pxPerRem_ = 1 / parseFloat(style.fontSize);
    }

    public addTouchResponder(touchResponder: ITouchResponder) {
        const index = this.touchResponders_.indexOf(touchResponder);
        Debug.assert(index < 0);
        this.touchResponders_.push(touchResponder);
    }

    public removeTouchResponder(touchResponder: ITouchResponder) {
        const index = this.touchResponders_.indexOf(touchResponder);
        Debug.assert(index >= 0);
        this.touchResponders_.splice(index, 1);
    }

    private readonly onWindowMouseMove_ = (e: MouseEvent) => {
        if (e.buttons !== 1) {
            for (const r of this.touchResponders_) {
                r.onTouchUp(-1, true, e.timeStamp);
            }
        } else {
            for (const r of this.touchResponders_) {
                r.onTouchMoved(-1, e.pageX, e.pageY, e.timeStamp);
            }
        }
    };

    private readonly onWindowMouseUp_ = (e: MouseEvent) => {
        if (e.button === 0) {
            for (const r of this.touchResponders_) {
                r.onTouchUp(-1, false, e.timeStamp);
            }
        }
    };

    private readonly onWindowTouchMove_ = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; ++i) {
            const touch = e.changedTouches.item(i);
            if (touch) {
                for (const r of this.touchResponders_) {
                    r.onTouchMoved(touch.identifier, touch.pageX, touch.pageY, e.timeStamp);
                }
            }
        }
    };

    private readonly onWindowTouchEnd_ = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; ++i) {
            const touch = e.changedTouches.item(i);
            if (touch) {
                for (const r of this.touchResponders_) {
                    r.onTouchUp(touch.identifier, false, e.timeStamp);
                }
            }
        }
    };

    private readonly onWindowTouchCancel_ = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; ++i) {
            const touch = e.changedTouches.item(i);
            if (touch) {
                for (const r of this.touchResponders_) {
                    r.onTouchUp(touch.identifier, true, e.timeStamp);
                }
            }
        }
    };
}
