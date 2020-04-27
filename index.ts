import { Game } from "~Klondike/Model/Game";
import { GameOptions } from "~Klondike/Model/GameOptions";
import { GamePresenter } from "~Klondike/Presenter/GamePresenter";

window.addEventListener("load", () => {
    const options = new GameOptions();
    const game = new Game(options);
    const gamePresenter = new GamePresenter(game, document.body);
});