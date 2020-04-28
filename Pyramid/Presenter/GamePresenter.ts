import { GamePresenterBase } from "~CardLib/Presenter/GamePresenterBase";
import { IView } from "~CardLib/View/IView";
import { PileView } from "~CardLib/View/PileView";
import { Rect } from "~CardLib/View/Rect";
import { IGame } from "../Model/IGame";

const edgeMargin = 2;
const sizeY = 18;
const sizeX = sizeY / 1.555555555555;
const pyramidMarginX = 2;
const pyramidMarginY = -6;

export class GamePresenter extends GamePresenterBase {
    private readonly game_: IGame;
    private readonly stockPile_: PileView;
    private readonly wastePile_: PileView;
    private readonly foundationPile_: PileView;
    private readonly pyramidPiles_: PileView[][] = [];

    constructor(game: IGame, rootView: IView) {
        super(game, rootView);
        this.game_ = game;

        // create piles:
        {
            const pileView = this.createPileView_(game.stock);
            pileView.rect = new Rect(sizeX, sizeY,
                (0 - 0.5 * (game.pyramid.length - 1)) * (sizeX + pyramidMarginX),
                (0 - 0.5 * (game.pyramid.length - 1)) * (sizeY + pyramidMarginY));
            pileView.showFrame = true;
            this.stockPile_ = pileView;
        }
        {
            const pileView = this.createPileView_(game.waste);
            pileView.rect = new Rect(sizeX, sizeY,
                (1 - 0.5 * (game.pyramid.length - 1)) * (sizeX + pyramidMarginX),
                (0 - 0.5 * (game.pyramid.length - 1)) * (sizeY + pyramidMarginY));
            pileView.showFrame = true;
            pileView.zIndex = 50;
            this.wastePile_ = pileView;
        }
        {
            const pileView = this.createPileView_(game.foundation);
            pileView.rect = new Rect(sizeX, sizeY,
                (game.pyramid.length - 1 - 0.5 * (game.pyramid.length - 1)) * (sizeX + pyramidMarginX),
                (0 - 0.5 * (game.pyramid.length - 1)) * (sizeY + pyramidMarginY));
            pileView.showFrame = true;
            pileView.zIndex = 800;
            this.foundationPile_ = pileView;
        }
        for (let y = 0; y < game.pyramid.length; ++y) {
            this.pyramidPiles_.push([]);
            const row = game.pyramid[y];
            for (let x = 0; x < row.length; ++x) {
                const pile = row[x];
                const pileView = this.createPileView_(pile);
                this.pyramidPiles_[y].push(pileView);

                pileView.rect = new Rect(
                    sizeX, sizeY,
                    (x - 0.5 * (row.length - 1)) * (sizeX + pyramidMarginX),
                    (y - 0.5 * (game.pyramid.length - 1)) * (sizeY + pyramidMarginY));
                pileView.zIndex = 100 * y;
            }
        }

        // create cards:
        for (const card of game.cards) {
            this.createCardView_(card);
        }
    }

    protected onResize_() {
    }
}