import { ICard } from "./ICard";
import { IPile } from "./IPile";
import { DelayHint } from "./DelayHint";

export interface IGameBase {
    /** All the cards in the game. */
    cards: ICard[];

    /** All the piles in the game. */
    piles: IPile[];

    won: boolean;

    unwinnable: boolean;

    restart(seed: number): Generator<DelayHint, void>;

    undo(): Generator<DelayHint, void>;

    redo(): Generator<DelayHint, void>;

    getHint(): { card: ICard; pile: IPile; };

    /** Primary interaction with a pile, usually a left click or tap. */
    pilePrimary(pile: IPile): Generator<DelayHint, void>;

    /** Secondary interaction with a pile, usually a double click or a right click. */
    pileSecondary(pile: IPile): Generator<DelayHint, void>;

    /** Primary interaction with a card, usually a left click or tap. */
    cardPrimary(card: ICard): Generator<DelayHint, void>;

    /** Secondary interaction with a card, usually a double click or a right click. */
    cardSecondary(card: ICard): Generator<DelayHint, void>;

    /** Is a card allowed to be dragged?
     * @param card the card being dragged
     * @returns an object containing keys:
     *  * `canDrag`: true on success
     *  * `alsoDrag`: a list of cards that should be dragged along with the picked card
     */
    canDrag(card: ICard): { canDrag: boolean; alsoDrag: ICard[]; };

    /** Will something happen if this card is dropped on this pile? */
    previewDrop(card: ICard, pile: IPile): boolean;

    /** A card has been dragged from somewhere and dropped on a pile. */
    dropCard(card: ICard, pile: IPile): Generator<DelayHint, void>;
}