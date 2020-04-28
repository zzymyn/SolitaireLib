import { Rect } from "./Rect";
import { TemplatedElementView } from "./TemplatedElementView";
import { ViewContext } from "./ViewContext";

export class PileView extends TemplatedElementView {
    public click = () => { };
    public dblClick = () => { };
    public fanX = 0;
    public fanY = 0;
    public cardCount = 0;

    private readonly rect_ = new Rect();
    public get rect() {
        return new Rect().set(this.rect_);
    }
    public set rect(rect: Rect) {
        this.rect_.set(rect);
        rect.setOnElement(this.element_);
    }

    public get hitbox() {
        const rect = new Rect().set(this.rect_);
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
        this.element_.style.zIndex = `${zIndex}`;
    }

    private showFrame_ = false;
    public get showFrame() { return this.showFrame_; }
    public set showFrame(showFrame: boolean) {
        if (this.showFrame_ === showFrame)
            return;
        this.showFrame_ = showFrame;
        if (showFrame) {
            this.element_.classList.add("showFrame");
        } else {
            this.element_.classList.remove("showFrame");
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

    constructor(context: ViewContext, parent: HTMLElement) {
        super(context, parent, "pileTemplate");
        this.element_.addEventListener("click", this.onClick_);
        this.element_.addEventListener("dblclick", this.onDblClick_);
    }

    private readonly onClick_ = (e: MouseEvent) => {
        this.click();
    }

    private readonly onDblClick_ = (e: MouseEvent) => {
        this.dblClick();
    }
}