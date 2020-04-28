import { IView } from "./IView";
import { ViewContext } from "./ViewContext";

export class RootView implements IView {
    public readonly context: ViewContext;
    public readonly element: HTMLElement;

    constructor(element: HTMLElement) {
        this.context = new ViewContext();
        this.element = element;
    }
}