import { Debug } from "../Debug";
import { ViewContext } from "./ViewContext";

export abstract class TemplatedElementView {
    protected readonly context_: ViewContext;
    protected readonly element_: HTMLElement;

    constructor(context: ViewContext, parent: HTMLElement, templateId: string) {
        this.context_ = context;

        const template = document.getElementById(templateId);
        if (!(template instanceof HTMLTemplateElement))
            Debug.error();
        const templateDiv = template.content.firstElementChild;
        if (!(templateDiv instanceof HTMLElement))
            Debug.error();

        const element = document.importNode(templateDiv, true);
        if (!(element instanceof HTMLElement))
            Debug.error();

        this.element_ = element as HTMLElement;

        parent.appendChild(element);
    }
}