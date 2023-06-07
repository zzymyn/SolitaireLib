import * as MathEx from "~CardLib/MathEx";
import { GameOptionsBase } from "~CardLib/Model/GameOptionsBase";
import * as URLSearchParamsEx from "~CardLib/URLSearchParamsEx";

export class GameOptions extends GameOptionsBase {
    public stockDraws = 1;
    public restocksAllowed = Infinity;
    public autoReveal = true;
    public autoPlayStock = true;
    public autoMoveToFoundation = 2;

    public get saveKey() {
        return {
            stockDraws: this.stockDraws,
            restocksAllowed: this.restocksAllowed,
        };
    }

    constructor(params: URLSearchParams) {
        super();
        this.stockDraws = MathEx.clamp(URLSearchParamsEx.getNumber(params, "stockDraws", 1), 1, 5);
        this.restocksAllowed = URLSearchParamsEx.getNumber(params, "restocksAllowed", Infinity);
        this.autoReveal = URLSearchParamsEx.getBool(params, "autoReveal", true);
        this.autoPlayStock = URLSearchParamsEx.getBool(params, "autoPlayStock", true);
        this.autoMoveToFoundation = Math.max(0, URLSearchParamsEx.getNumber(params, "autoMoveToFoundation", 2));
    }

    public toURLSearchParams(): URLSearchParams {
        const params = new URLSearchParams();
        URLSearchParamsEx.setNumber(params, "stockDraws", this.stockDraws, 1);
        URLSearchParamsEx.setNumber(params, "restocksAllowed", this.restocksAllowed, Infinity);
        URLSearchParamsEx.setBool(params, "autoReveal", this.autoReveal, true);
        URLSearchParamsEx.setBool(params, "autoPlayStock", this.autoPlayStock, true);
        URLSearchParamsEx.setNumber(params, "autoMoveToFoundation", this.autoMoveToFoundation, 2);
        return params;
    }
}
