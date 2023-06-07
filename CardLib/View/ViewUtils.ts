import * as Debug from "~CardLib/Debug";

export function instantiateTemplate(parentElement: HTMLElement, templateId: string) {
    const template = document.getElementById(templateId);
    if (!(template instanceof HTMLTemplateElement)) Debug.error();

    const templateDiv = template.content.firstElementChild;
    if (!(templateDiv instanceof HTMLElement)) Debug.error();

    const element = document.importNode(templateDiv, true);
    if (!(element instanceof HTMLElement)) Debug.error();

    return parentElement.appendChild(element);
}
