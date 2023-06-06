import { IGameInfo } from "~CardLib/IGameInfo";
import { GamePresenterFactory } from "./Presenter/GamePresenterFactory";

class GameInfo implements IGameInfo {
    public gameId = "klondikeex";
    public gameName = "Klondike Ex";
    public gamePresenterFactory = new GamePresenterFactory();
}

export default new GameInfo();
