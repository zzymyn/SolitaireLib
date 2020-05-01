import { GameOptionsBase } from "~CardLib/Model/GameOptionsBase";

export class GameOptions extends GameOptionsBase {
    public restocksAllowed = 2;
    public autoRevealStockTop = true;
    public autoPlayKings = true;

    public get saveKey() {
        return {
            restocksAllowed: this.restocksAllowed
        };
    }

    constructor(params: URLSearchParams) {
        super(params);
        this.restocksAllowed = this.getNumber_("restocksAllowed", Infinity);
        this.autoRevealStockTop = this.getBool_("autoRevealStockTop", true);
        this.autoPlayKings = this.getBool_("autoPlayKings", true);
    }
}