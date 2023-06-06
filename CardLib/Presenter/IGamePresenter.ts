import { IDisposable } from "~CardLib/IDisposable";

export interface IGamePresenter extends IDisposable {
    start(): void;
}
