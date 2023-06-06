import { IGameBase } from "~CardLib/Model/IGameBase";
import { IPile } from "~CardLib/Model/IPile";
import { GameOptions } from "./GameOptions";

export interface IGame extends IGameBase {
    readonly options: GameOptions;
    readonly stock: IPile;
    readonly waste: IPile;
    readonly foundation: IPile;
    readonly pyramid: IPile[][];
}
