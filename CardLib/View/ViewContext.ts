import { ITouchResponder } from "./ITouchResponder";
import { Debug } from "~CardLib/Debug";

export class ViewContext {
    private htmlRoot_: HTMLElement;
    public pxPerRem = 0;
    private touchResponders_: ITouchResponder[] = [];

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

        this.refresh();
    }

    private onResize_ = () => {
        this.refresh();
    }

    private refresh() {
        const style = getComputedStyle(document.body);
        this.pxPerRem = 1.0 / parseFloat(style.fontSize);
    }

    private onWindowMouseMove_ = (e: MouseEvent) => {
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

    private onWindowMouseUp_ = (e: MouseEvent) => {
        if (e.button === 0) {
            for (const r of this.touchResponders_) {
                r.onTouchUp(-1, false);
            }
        }
    }

    private onWindowTouchMove_ = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; ++i) {
            const touch = e.changedTouches.item(i);
            if (touch) {
                for (const r of this.touchResponders_) {
                    r.onTouchMoved(touch.identifier, touch.pageX, touch.pageY);
                }
            }
        }
    }

    private onWindowTouchEnd_ = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; ++i) {
            const touch = e.changedTouches.item(i);
            if (touch) {
                for (const r of this.touchResponders_) {
                    r.onTouchUp(touch.identifier, false);
                }
            }
        }
    }

    private onWindowTouchCancel_ = (e: TouchEvent) => {
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