import { IGamePresenter } from "~CardLib/Presenter/IGamePresenter";
import { IGamePresenterFactory } from "~CardLib/Presenter/IGamePresenterFactory";
import { RootView } from "~CardLib/View/RootView";
import { Game } from "../Model/Game";
import { GameOptions } from "../Model/GameOptions";
import { GamePresenter } from "./GamePresenter";

export const GAME_ID = "pyramid";

export class GamePresenterFactory implements IGamePresenterFactory {
    public createGame(parentElement: HTMLElement, searchParams: URLSearchParams): IGamePresenter {
        const options = new GameOptions(searchParams);
        const game = new Game(options);
        const view = new RootView(parentElement);
        return new GamePresenter(game, view);
    }
}
