import { IGameInfo } from "~CardLib/IGameInfo";
import { GamePresenterFactory } from "./Presenter/GamePresenterFactory";

class GameInfo implements IGameInfo {
    public gameId = "pyramid";
    public gameName = "Pyramid";
    public gamePresenterFactory = new GamePresenterFactory();
}

export default new GameInfo();
