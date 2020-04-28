import { ViewContext } from "./ViewContext";

export interface IView {
    readonly context: ViewContext;
    readonly element: HTMLElement;
}