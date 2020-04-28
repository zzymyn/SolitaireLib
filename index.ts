import { RootView } from "~CardLib/View/RootView";
import { Game } from "~Klondike/Model/Game";
import { GameOptions } from "~Klondike/Model/GameOptions";
import { GamePresenter } from "~Klondike/Presenter/GamePresenter";

window.addEventListener("load", () => {
    const options = new GameOptions();
    const game = new Game(options);
    const view = new RootView(document.body);
    const gamePresenter = new GamePresenter(game, view);
});