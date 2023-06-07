import { GameOptionsBase } from "~CardLib/Model/GameOptionsBase";
import * as URLSearchParamsEx from "~CardLib/URLSearchParamsEx";

export class GameOptions extends GameOptionsBase {
    public restocksAllowed = 2;
    public autoRevealStockTop = true;
    public autoPlayKings = true;

    public get saveKey() {
        return {
            restocksAllowed: this.restocksAllowed,
        };
    }

    constructor(params: URLSearchParams) {
        super();
        this.restocksAllowed = URLSearchParamsEx.getNumber(params, "restocksAllowed", Infinity);
        this.autoRevealStockTop = URLSearchParamsEx.getBool(params, "autoRevealStockTop", true);
        this.autoPlayKings = URLSearchParamsEx.getBool(params, "autoPlayKings", true);
    }

    public toURLSearchParams(): URLSearchParams {
        const params = new URLSearchParams();
        URLSearchParamsEx.setNumber(params, "restocksAllowed", this.restocksAllowed, Infinity);
        URLSearchParamsEx.setBool(params, "autoRevealStockTop", this.autoRevealStockTop, true);
        URLSearchParamsEx.setBool(params, "autoPlayKings", this.autoPlayKings, true);
        return params;
    }
}
