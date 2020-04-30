import { Debug } from "~CardLib/Debug";
import { IGamePresenter } from "~CardLib/Presenter/IGamePresenter";
import { IGamePresenterFactory } from "~CardLib/Presenter/IGamePresenterFactory";
import * as Klondike from "~Games/Klondike/Presenter/GamePresenterFactory";
import * as Pyramid from "~Games/Pyramid/Presenter/GamePresenterFactory";

window.addEventListener("load", () => {
    const gamePresenterFactories = new Map<string, IGamePresenterFactory>();
    gamePresenterFactories.set("", new Klondike.GamePresenterFactory());
    gamePresenterFactories.set("klondike", new Klondike.GamePresenterFactory());
    gamePresenterFactories.set("pyramid", new Pyramid.GamePresenterFactory());

    const tableHolder = document.getElementById("tableHolder") ?? document.body;

    let currentGame: IGamePresenter | undefined;

    const refreashGame = () => {
        if (currentGame) {
            currentGame.dispose();
            currentGame = undefined;
        }

        const hash = window.location.hash;
        const qPos = hash.indexOf("?");
        let params;
        let gameKey;

        if (qPos >= 0) {
            params = new URLSearchParams(hash.substr(qPos + 1));
            gameKey = hash.substr(1, qPos - 1);
        } else if (hash.indexOf("&") >= 0 || hash.indexOf("?") >= 0 || hash.indexOf("=") >= 0) {
            params = new URLSearchParams(hash.substr(1));
            gameKey = params.get("game") ?? "klondike";
        } else {
            params = new URLSearchParams("");
            gameKey = hash.substr(1);
        }

        const gamePresenterFactory = gamePresenterFactories.get(gameKey);
        if (!gamePresenterFactory)
            Debug.error(`Unknown game ${gameKey}.`);

        currentGame = gamePresenterFactory.createGame(tableHolder, params);
    };

    window.addEventListener("hashchange", refreashGame);
    refreashGame();
});

