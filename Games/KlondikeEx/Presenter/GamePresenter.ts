import { error } from "~CardLib/Debug";
import * as MathEx from "~CardLib/MathEx";
import { GamePresenterBase } from "~CardLib/Presenter/GamePresenterBase";
import { IView } from "~CardLib/View/IView";
import { PileView } from "~CardLib/View/PileView";
import { Rect } from "~CardLib/View/Rect";
import { IGame } from "../Model/IGame";

export class GamePresenter extends GamePresenterBase<IGame> {
    private readonly stockPile_: PileView;
    private readonly foundationPiles_: PileView[] = [];
    private readonly tableauPiles_: PileView[] = [];

    protected get saveDataKey_() {
        return JSON.stringify({
            gameName: "klondike",
            version: 0,
            options: this.game_.options.saveKey,
        });
    }

    constructor(game: IGame, rootView: IView) {
        super(game, rootView);

        // create piles:
        {
            const pileView = this.createPileView_(game.stock);
            pileView.showFrame = true;
            pileView.fanYUp = 3;
            pileView.fanYDown = 3;
            this.stockPile_ = pileView;
        }
        for (let i = 0; i < this.game_.foundations.length; ++i) {
            const pileView = this.createPileView_(game.foundations[i] ?? error());
            pileView.showFrame = true;
            pileView.zIndex = 800;
            this.foundationPiles_.push(pileView);
        }
        for (let i = 0; i < this.game_.tableaux.length; ++i) {
            const pileView = this.createPileView_(game.tableaux[i] ?? error());
            pileView.showFrame = true;
            pileView.zIndex = 800;
            this.tableauPiles_.push(pileView);
        }

        // create cards:
        for (const card of game.cards) {
            this.createCardView_(card);
        }

        this.layoutPiles_();
        this.relayoutAll_();
    }

    protected onResize_() {
        this.layoutPiles_();
        this.relayoutAll_();
    }

    private layoutPiles_() {
        const aspect = this.rootView_.element.clientWidth / this.rootView_.element.clientHeight;

        let tableSize = this.game_.tableaux.length;
        const margin = 1;
        let sizeY = 20;
        let pileMove = 0;
        let vExpand = 1;
        let fExpand = 1;
        let h = true;

        if (aspect < 0.77) {
            vExpand = 1.5;
            h = false;
        } else {
            pileMove += 1;
            tableSize += 1;
            if (aspect < 1.12) {
                sizeY = MathEx.lerp(20, 17.5, MathEx.inverseLerp(1.12, 1, aspect));
                fExpand = sizeY / 20;
            }
        }

        const sizeX = sizeY / 1.555555555555;

        const xPos = (i: number) => {
            return (i - 0.5 * (tableSize - 1)) * (sizeX + margin);
        };

        {
            const pile = this.game_.stock;
            const pileView = this.getPileView_(pile);
            if (h) {
                pileView.rect = new Rect(sizeX, sizeY, xPos(0), vExpand * -35 + margin);
                pileView.fanXDown = 0;
                pileView.fanXUp = 0;
                pileView.fanYDown = fExpand * 3;
                pileView.fanYUp = fExpand * 3;
            } else {
                pileView.rect = new Rect(sizeX, sizeY, xPos(0), 50 / aspect - sizeY);
                pileView.fanXDown = fExpand * 3.6;
                pileView.fanXUp = fExpand * 3.6;
                pileView.fanYDown = 0;
                pileView.fanYUp = 0;
            }
        }
        for (let i = 0; i < this.game_.foundations.length; ++i) {
            const pile = this.game_.foundations[i] ?? error();
            const pileView = this.getPileView_(pile);
            pileView.rect = new Rect(
                sizeX,
                sizeY,
                xPos(tableSize - this.game_.foundations.length + i),
                vExpand * -35 + margin
            );
        }
        for (let i = 0; i < this.game_.tableaux.length; ++i) {
            const pile = this.game_.tableaux[i] ?? error();
            const pileView = this.getPileView_(pile);
            pileView.rect = new Rect(
                sizeX,
                sizeY,
                xPos(i + pileMove),
                vExpand * -35 + margin + margin + sizeY + margin
            );
            pileView.fanYDown = fExpand * 3.5;
            pileView.fanYUp = fExpand * vExpand * 3.5;
        }
    }
}
