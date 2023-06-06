import { IGamePresenter } from "./IGamePresenter";

export interface IGamePresenterFactory {
    createGame(parentElement: HTMLElement, options: object): IGamePresenter;
}
