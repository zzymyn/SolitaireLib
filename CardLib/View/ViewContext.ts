export class ViewContext {
    private htmlRoot_: HTMLElement;
    public pxPerRem = 0;

    constructor(htmlRoot: HTMLElement) {
        this.htmlRoot_ = htmlRoot;
        window.addEventListener("resize", this.onResize_);
        this.refresh();
    }

    private onResize_ = () => {
        this.refresh();
    }

    private refresh() {
        var style = getComputedStyle(document.body);
        this.pxPerRem = 1.0 / parseFloat(style.fontSize);
        console.log(this.pxPerRem);
    }
}