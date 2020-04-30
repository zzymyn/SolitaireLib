import { RootView } from "~CardLib/View/RootView";
import { Game } from "~Pyramid/Model/Game";
import { GameOptions } from "~Pyramid/Model/GameOptions";
import { GamePresenter } from "~Pyramid/Presenter/GamePresenter";

window.addEventListener("load", () => {
    const table = document.getElementById("table") ?? document.body;
    const options = new GameOptions();
    const game = new Game(options);
    const view = new RootView(table);
    const gamePresenter = new GamePresenter(game, view);
});