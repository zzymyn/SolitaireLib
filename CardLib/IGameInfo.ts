import { IGamePresenterFactory } from "./Presenter/IGamePresenterFactory";

export interface IGameInfo {
    gameId: string;
    gameName: string;
    gamePresenterFactory: IGamePresenterFactory;
}
