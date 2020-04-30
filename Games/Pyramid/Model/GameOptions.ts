import { GameOptionsBase } from "~CardLib/Model/GameOptionsBase";

export class GameOptions extends GameOptionsBase {
    public restocksAllowed = 2;
    public autoRevealStockTop = true;
    public autoPlayKings = true;

    constructor(params: URLSearchParams) {
        super(params);
        this.restocksAllowed = this.getFloat_("restocksAllowed", Infinity);
        this.autoRevealStockTop = this.getBool_("autoRevealStockTop", true);
        this.autoPlayKings = this.getBool_("autoPlayKings", true);
    }
}