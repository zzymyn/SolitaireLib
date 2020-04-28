import { Debug } from "../Debug";
import { IView } from "./IView";
import { ViewContext } from "./ViewContext";

export abstract class TemplatedElementView implements IView {
    public readonly context: ViewContext;
    public readonly element: HTMLElement;

    constructor(parent: IView, templateId: string) {
        this.context = parent.context;

        const template = document.getElementById(templateId);
        if (!(template instanceof HTMLTemplateElement))
            Debug.error();
        const templateDiv = template.content.firstElementChild;
        if (!(templateDiv instanceof HTMLElement))
            Debug.error();

        const element = document.importNode(templateDiv, true);
        if (!(element instanceof HTMLElement))
            Debug.error();

        this.element = element as HTMLElement;

        parent.element.appendChild(element);
    }
}