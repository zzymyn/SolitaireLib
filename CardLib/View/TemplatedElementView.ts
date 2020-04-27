import { Debug } from "../Debug";
import { Rect } from "./Rect";

export abstract class TemplatedElementView {
    protected readonly element: HTMLElement;

    constructor(parent: HTMLElement, templateId: string) {
        let template = document.getElementById(templateId);
        if (!(template instanceof HTMLTemplateElement))
            Debug.error();
        let templateDiv = template.content.firstElementChild;
        if (!(templateDiv instanceof HTMLElement))
            Debug.error();

        let element = document.importNode(templateDiv, true);
        if (!(element instanceof HTMLElement))
            Debug.error();

        this.element = element as HTMLElement;

        parent.appendChild(element);
    }
}