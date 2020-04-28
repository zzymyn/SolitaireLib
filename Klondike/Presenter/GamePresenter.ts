import { GamePresenterBase } from "~CardLib/Presenter/GamePresenterBase";
import { IView } from "~CardLib/View/IView";
import { PileView } from "~CardLib/View/PileView";
import { Rect } from "~CardLib/View/Rect";
import { IGame } from "../Model/IGame";

const margin = 1;
const sizeY = 20;
const sizeX = sizeY / 1.555555555555;

export class GamePresenter extends GamePresenterBase {
    private readonly game_: IGame;
    private readonly stockPile_: PileView;
    private readonly wastePile_: PileView;
    private readonly foundationPiles_: PileView[] = [];
    private readonly tableauPiles_: PileView[] = [];

    constructor(game: IGame, rootView: IView) {
        super(game, rootView);
        this.game_ = game;

        const tableSize = this.game_.tableaux.length;

        const xPos = (i: number) => {
            return (i - 0.5 * (tableSize - 1)) * (sizeX + margin);
        };

        // create piles:
        {
            const pileView = this.createPileView_(game.stock);
            pileView.rect = new Rect(sizeX, sizeY, xPos(0), -35 + margin);
            pileView.showFrame = true;
            this.stockPile_ = pileView;
        }
        {
            const pileView = this.createPileView_(game.waste);
            pileView.rect = new Rect(sizeX, sizeY, xPos(1), -35 + margin);
            pileView.showFrame = true;
            pileView.zIndex = 50;
            this.wastePile_ = pileView;
        }
        for (let i = 0; i < this.game_.foundations.length; ++i) {
            const pileView = this.createPileView_(game.foundations[i]);
            pileView.rect = new Rect(sizeX, sizeY, xPos(tableSize - this.game_.foundations.length + i), -35 + margin);
            pileView.showFrame = true;
            pileView.zIndex = 800;
            this.foundationPiles_.push(pileView);
        }
        for (let i = 0; i < this.game_.tableaux.length; ++i) {
            const pileView = this.createPileView_(game.tableaux[i]);
            pileView.rect = new Rect(sizeX, sizeY, xPos(i), -35 + margin + margin + sizeY + margin);
            pileView.showFrame = true;
            pileView.zIndex = 800;
            pileView.fanY = 3.5;
            this.tableauPiles_.push(pileView);
        }

        // create cards:
        for (const card of game.cards) {
            this.createCardView_(card);
        }
    }

    protected onResize_() {
    }
}