import { RootView } from "~CardLib/View/RootView";
import { Game } from "~Pyramid/Model/Game";
import { GameOptions } from "~Pyramid/Model/GameOptions";
import { GamePresenter } from "~Pyramid/Presenter/GamePresenter";

window.addEventListener("load", () => {
    const tableHolder = document.getElementById("tableHolder") ?? document.body;
    const options = new GameOptions();
    const game = new Game(options);
    const view = new RootView(tableHolder);
    const gamePresenter = new GamePresenter(game, view);
});