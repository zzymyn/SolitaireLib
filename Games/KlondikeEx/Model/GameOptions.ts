import { GameOptionsBase } from "~CardLib/Model/GameOptionsBase";
import * as URLSearchParamsEx from "~CardLib/URLSearchParamsEx";

export class GameOptions extends GameOptionsBase {
    public autoReveal = true;
    public autoMoveToFoundation = 2;
    public autoCollateKings = true;

    public get saveKey() {
        return {};
    }

    constructor(params: URLSearchParams) {
        super();
        this.autoReveal = URLSearchParamsEx.getBool(params, "autoReveal", true);
        this.autoMoveToFoundation = Math.max(0, URLSearchParamsEx.getNumber(params, "autoMoveToFoundation", 2));
        this.autoCollateKings = URLSearchParamsEx.getBool(params, "autoCollateKings", true);
    }

    public toURLSearchParams(): URLSearchParams {
        const params = new URLSearchParams();
        URLSearchParamsEx.setBool(params, "autoReveal", this.autoReveal, true);
        URLSearchParamsEx.setNumber(params, "autoMoveToFoundation", this.autoMoveToFoundation, 2);
        URLSearchParamsEx.setBool(params, "autoCollateKings", this.autoCollateKings, true);
        return params;
    }
}
