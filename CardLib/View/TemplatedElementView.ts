import { Debug } from "../Debug";
import { Rect } from "./Rect";

export abstract class TemplatedElementView {
    protected readonly element: HTMLElement;

    constructor(parent: HTMLElement, templateId: string) {
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

        parent.appendChild(element);
    }
}