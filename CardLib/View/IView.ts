import { IDisposable } from "~CardLib/IDisposable";
import { ViewContext } from "./ViewContext";

export interface IView extends IDisposable {
    readonly context: ViewContext;
    readonly element: HTMLElement;
}
