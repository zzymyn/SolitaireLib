import { IView } from "./IView";
import { ViewContext } from "./ViewContext";
import { instantiateTemplate } from "./ViewUtils";

export class RootView implements IView {
    public readonly context: ViewContext;
    public readonly element: HTMLElement;

    constructor(parentElement: HTMLElement) {
        this.context = new ViewContext(parentElement);
        this.element = instantiateTemplate(parentElement, "rootViewTemplate");
    }

    public dispose() {
        this.element.remove();
    }
}
