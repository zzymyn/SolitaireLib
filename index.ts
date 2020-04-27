import { Game } from "~Klondike/Model/Game";
import { GameOptions } from "~Klondike/Model/GameOptions";
import { GamePresenter } from "~Klondike/Presenter/GamePresenter";

window.addEventListener("load", () => {
    let options = new GameOptions();
    let game = new Game(options);
    let gamePresenter = new GamePresenter(game, document.body);
});