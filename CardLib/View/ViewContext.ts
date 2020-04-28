import { Debug } from "~CardLib/Debug";
import { ITouchResponder } from "./ITouchResponder";

export class ViewContext {
    private readonly htmlRoot_: HTMLElement;
    public pxPerRem = 0;
    private readonly touchResponders_: ITouchResponder[] = [];

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

    constructor(htmlRoot: HTMLElement) {
        this.htmlRoot_ = htmlRoot;
        window.addEventListener("resize", this.onResize_);

        window.addEventListener("mousemove", this.onWindowMouseMove_);
        window.addEventListener("mouseup", this.onWindowMouseUp_);

        window.addEventListener("touchmove", this.onWindowTouchMove_);
        window.addEventListener("touchend", this.onWindowTouchEnd_);
        window.addEventListener("touchcancel", this.onWindowTouchCancel_);

        this.refresh_();
    }

    private readonly onResize_ = () => {
        this.refresh_();
    }

    private refresh_() {
        const style = getComputedStyle(document.body);
        this.pxPerRem = 1 / parseFloat(style.fontSize);
    }

    private readonly onWindowMouseMove_ = (e: MouseEvent) => {
        if (e.buttons !== 1) {
            for (const r of this.touchResponders_) {
                r.onTouchUp(-1, true);
            }
        } else {
            for (const r of this.touchResponders_) {
                r.onTouchMoved(-1, e.pageX, e.pageY);
            }
        }
    }

    private readonly onWindowMouseUp_ = (e: MouseEvent) => {
        if (e.button === 0) {
            for (const r of this.touchResponders_) {
                r.onTouchUp(-1, false);
            }
        }
    }

    private readonly onWindowTouchMove_ = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; ++i) {
            const touch = e.changedTouches.item(i);
            if (touch) {
                for (const r of this.touchResponders_) {
                    r.onTouchMoved(touch.identifier, touch.pageX, touch.pageY);
                }
            }
        }
    }

    private readonly onWindowTouchEnd_ = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; ++i) {
            const touch = e.changedTouches.item(i);
            if (touch) {
                for (const r of this.touchResponders_) {
                    r.onTouchUp(touch.identifier, false);
                }
            }
        }
    }

    private readonly onWindowTouchCancel_ = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; ++i) {
            const touch = e.changedTouches.item(i);
            if (touch) {
                for (const r of this.touchResponders_) {
                    r.onTouchUp(touch.identifier, true);
                }
            }
        }
    }
}