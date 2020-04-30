import { GameOptionsBase } from "~CardLib/Model/GameOptionsBase";

export class GameOptions extends GameOptionsBase {
    public restocksAllowed = Infinity;
    public autoReveal = true;
    public autoPlayStock = true;
    public autoMoveToFoundation = 2;

    constructor(params: URLSearchParams) {
        super(params);
        this.restocksAllowed = this.getFloat_("restocksAllowed", Infinity);
        this.autoReveal = this.getBool_("autoReveal", true);
        this.autoPlayStock = this.getBool_("autoPlayStock", true);
        this.autoMoveToFoundation = this.getInt_("autoMoveToFoundation", 2);
    }
}