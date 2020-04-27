import { IGameBase } from "~CardLib/Model/IGameBase";
import { IPile } from "~CardLib/Model/IPile";

export interface IGame extends IGameBase {
    readonly stock: IPile;
    readonly waste: IPile;
    readonly foundation: IPile;
    readonly pyramid: IPile[][];
}