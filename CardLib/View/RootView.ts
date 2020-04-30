import { IView } from "./IView";
import { ViewContext } from "./ViewContext";
import { ViewUtils } from "./ViewUtils";

export class RootView implements IView {
    public readonly context: ViewContext;
    public readonly element: HTMLElement;

    constructor(parentElement: HTMLElement) {
        this.context = new ViewContext(parentElement);
        this.element = ViewUtils.instantiateTemplate(parentElement, "rootViewTemplate");
    }
}