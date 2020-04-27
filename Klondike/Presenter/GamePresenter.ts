import { GamePresenterBase } from "~CardLib/Presenter/GamePresenterBase";
import { PileView } from "~CardLib/View/PileView";
import { Rect } from "~CardLib/View/Rect";
import { IGame } from "../Model/IGame";

const margin = 2;
const sizeY = 18;
const sizeX = sizeY / 1.555555555555;

export class GamePresenter extends GamePresenterBase {
    private game_: IGame;
    private stockPile_: PileView;
    private wastePile_: PileView;
    private foundationPiles_: PileView[] = [];
    private tableauPiles_: PileView[] = [];

    constructor(game: IGame, htmlRoot: HTMLElement) {
        super(game, htmlRoot);
        this.game_ = game;

        var tableSize = this.game_.tableaux.length;

        var xPos = (i: number) => {
            return (i - 0.5 * (tableSize - 1)) * (sizeX + margin)
        };

        // create piles:
        {
            let pileView = this.createPileView_(game.stock);
            pileView.rect = new Rect(sizeX, sizeY, xPos(0), -40 + margin);
            pileView.showFrame = true;
            this.stockPile_ = pileView;
        }
        {
            let pileView = this.createPileView_(game.waste);
            pileView.rect = new Rect(sizeX, sizeY, xPos(1), -40 + margin);
            pileView.showFrame = true;
            pileView.zIndex = 50;
            this.wastePile_ = pileView;
        }
        for (let i = 0; i < this.game_.foundations.length; ++i) {
            let pileView = this.createPileView_(game.foundations[i]);
            pileView.rect = new Rect(sizeX, sizeY, xPos(tableSize - this.game_.foundations.length + i), -40 + margin);
            pileView.showFrame = true;
            pileView.zIndex = 800;
            this.foundationPiles_.push(pileView);
        }
        for (let i = 0; i < this.game_.tableaux.length; ++i) {
            let pileView = this.createPileView_(game.tableaux[i]);
            pileView.rect = new Rect(sizeX, sizeY, xPos(i), -40 + margin + margin + sizeY + margin);
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