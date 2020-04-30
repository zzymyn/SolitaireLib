import { IGameBase } from "~CardLib/Model/IGameBase";
import { IPile } from "~CardLib/Model/IPile";

export interface IGame extends IGameBase {
    readonly stock: IPile;
    readonly waste: IPile;
    readonly foundations: IPile[];
    readonly tableaux: IPile[];
}