import { MathEx } from "~CardLib/MathEx";
import { GameOptionsBase } from "~CardLib/Model/GameOptionsBase";

export class GameOptions extends GameOptionsBase {
    public stockDraws = 1;
    public restocksAllowed = Infinity;
    public autoReveal = true;
    public autoPlayStock = true;
    public autoMoveToFoundation = 2;

    constructor(params: URLSearchParams) {
        super(params);
        this.stockDraws = MathEx.clamp(this.getFloat_("stockDraws", 1), 1, 3);
        this.restocksAllowed = this.getFloat_("restocksAllowed", Infinity);
        this.autoReveal = this.getBool_("autoReveal", true);
        this.autoPlayStock = this.getBool_("autoPlayStock", true);
        this.autoMoveToFoundation = Math.max(0, this.getInt_("autoMoveToFoundation", 2));
    }
}