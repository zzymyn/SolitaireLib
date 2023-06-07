import * as Debug from "~CardLib/Debug";
import { IGameInfo } from "~CardLib/IGameInfo";
import { IGamePresenter } from "~CardLib/Presenter/IGamePresenter";
import Klondike from "~Games/Klondike/GameInfo";
import KlondikeEx from "~Games/KlondikeEx/GameInfo";
import Pyramid from "~Games/Pyramid/GameInfo";

const gameInfos = new Map<string, IGameInfo>();
gameInfos.set(Klondike.gameId, Klondike);
gameInfos.set(KlondikeEx.gameId, KlondikeEx);
gameInfos.set(Pyramid.gameId, Pyramid);

window.addEventListener("load", () => {
    const tableHolder = document.getElementById("tableHolder") ?? document.body;

    let currentGame: IGamePresenter | undefined;

    const refreshGame = () => {
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
        } else if (hash.includes("&") || hash.includes("?") || hash.includes("=")) {
            params = new URLSearchParams(hash.substr(1));
            gameKey = params.get("game");
        } else {
            params = new URLSearchParams("");
            gameKey = hash.substr(1);
        }

        if (!gameKey) gameKey = Klondike.gameId;

        const gameInfo = gameInfos.get(gameKey.toLowerCase());
        if (!gameInfo) Debug.error(`Unknown game ${gameKey}.`);

        currentGame = gameInfo.gamePresenterFactory.createGame(tableHolder, params);
        currentGame.start();
    };

    window.addEventListener("hashchange", refreshGame);
    refreshGame();
});
