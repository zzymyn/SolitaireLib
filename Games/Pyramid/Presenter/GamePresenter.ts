import { error } from "~CardLib/Debug";
import { GamePresenterBase } from "~CardLib/Presenter/GamePresenterBase";
import { IView } from "~CardLib/View/IView";
import { PileView } from "~CardLib/View/PileView";
import { Rect } from "~CardLib/View/Rect";
import { IGame } from "../Model/IGame";

const sizeY = 20;
const sizeX = sizeY / 1.555555555555;
const pyramidMarginX = 1.5;
const pyramidMarginY = -7;

export class GamePresenter extends GamePresenterBase<IGame> {
    private readonly stockPile_: PileView;
    private readonly wastePile_: PileView;
    private readonly foundationPile_: PileView;
    private readonly pyramidPiles_: PileView[][] = [];

    protected get saveDataKey_() {
        return JSON.stringify({
            gameName: "pyramid",
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
            this.stockPile_ = pileView;
        }
        {
            const pileView = this.createPileView_(game.waste);
            pileView.showFrame = true;
            pileView.zIndex = 50;
            this.wastePile_ = pileView;
        }
        {
            const pileView = this.createPileView_(game.foundation);
            pileView.showFrame = true;
            pileView.zIndex = 800;
            this.foundationPile_ = pileView;
        }
        for (let y = 0; y < game.pyramid.length; ++y) {
            const piles = game.pyramid[y] ?? error();
            const pileViews: PileView[] = [];
            for (const pile of piles) {
                const pileView = this.createPileView_(pile);
                pileView.zIndex = 100 * y;
                pileViews.push(pileView);
            }
            this.pyramidPiles_.push(pileViews);
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
        const pyramidSize = this.game_.pyramid.length;
        const xPos = (x: number, xMax: number) => (x - 0.5 * (xMax - 1)) * (sizeX + pyramidMarginX);
        const yPos = (y: number) => (y - 0.5 * (pyramidSize - 1)) * (sizeY + pyramidMarginY);

        {
            const pileView = this.stockPile_;
            pileView.rect = new Rect(sizeX, sizeY, xPos(0, pyramidSize), yPos(0));
        }
        {
            const pileView = this.wastePile_;
            pileView.rect = new Rect(sizeX, sizeY, xPos(1, pyramidSize), yPos(0));
        }
        {
            const pileView = this.foundationPile_;
            pileView.rect = new Rect(sizeX, sizeY, xPos(pyramidSize - 1, pyramidSize), yPos(0));
        }
        for (let y = 0; y < pyramidSize; ++y) {
            const gameRow = this.game_.pyramid[y] ?? error();
            for (let x = 0; x < gameRow.length; ++x) {
                const row = this.pyramidPiles_[y] ?? error();
                const pileView = row[x] ?? error();
                pileView.rect = new Rect(sizeX, sizeY, xPos(x, gameRow.length), yPos(y));
            }
        }
    }
}
