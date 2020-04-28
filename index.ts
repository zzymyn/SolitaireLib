import { RootView } from "~CardLib/View/RootView";
import { Game } from "~Klondike/Model/Game";
import { GameOptions } from "~Klondike/Model/GameOptions";
import { GamePresenter } from "~Klondike/Presenter/GamePresenter";

window.addEventListener("load", () => {
    const table = document.getElementById("table") ?? document.body;
    const options = new GameOptions();
    const game = new Game(options);
    const view = new RootView(table);
    const gamePresenter = new GamePresenter(game, view);
});