import { MathEx } from "~CardLib/MathEx";
import { GameOptionsBase } from "~CardLib/Model/GameOptionsBase";

export class GameOptions extends GameOptionsBase {
    public stockDraws = 1;
    public restocksAllowed = Infinity;
    public autoReveal = true;
    public autoPlayStock = true;
    public autoMoveToFoundation = 2;

    public get saveKey() {
        return {
            stockDraws: this.stockDraws,
            restocksAllowed: this.restocksAllowed
        };
    }

    constructor(params: URLSearchParams) {
        super(params);
        this.stockDraws = MathEx.clamp(this.getNumber_("stockDraws", 1), 1, 5);
        this.restocksAllowed = this.getNumber_("restocksAllowed", Infinity);
        this.autoReveal = this.getBool_("autoReveal", true);
        this.autoPlayStock = this.getBool_("autoPlayStock", true);
        this.autoMoveToFoundation = Math.max(0, this.getNumber_("autoMoveToFoundation", 2));
    }
}