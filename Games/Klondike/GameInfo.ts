import { IGameInfo } from "~CardLib/IGameInfo";
import { GamePresenterFactory } from "./Presenter/GamePresenterFactory";

class GameInfo implements IGameInfo {
    public gameId = "klondike";
    public gameName = "Klondike";
    public gamePresenterFactory = new GamePresenterFactory();
}

export default new GameInfo();
