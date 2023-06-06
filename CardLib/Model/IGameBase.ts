import { DelayHint } from "./DelayHint";
import { ICard } from "./ICard";
import { IPile } from "./IPile";

export interface IGameBase {
    /** All the cards in the game. */
    cards: ICard[];

    /** All the piles in the game. */
    piles: IPile[];

    readonly gamesStarted: number;
    gamesStartedChanged: () => void;
    readonly gamesWon: number;
    gamesWonChanged: () => void;

    /** Is undo available. */
    readonly canUndo: boolean;
    /** Undo the last move. */
    undo(): Generator<DelayHint, void>;
    /** Is redo available. */
    readonly canRedo: boolean;
    /** Redo the last undo. */
    redo(): Generator<DelayHint, void>;

    /** Is the game won. */
    readonly won: boolean;
    wonChanged: () => void;
    /** If the game is won, which cards are the winning cards. In order from bottom to top. */
    readonly wonCards: ICard[];

    /** Restart the game. */
    restart(seed: number): Generator<DelayHint, void>;

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
     *  * `extraCards`: a list of cards that should be dragged along with the picked card
     */
    canDrag(card: ICard): { canDrag: boolean; extraCards: ICard[] };

    /** Will something happen if this card is dropped on this pile? */
    previewDrop(card: ICard, pile: IPile): boolean;

    /** A card has been dragged from somewhere and dropped on a pile. */
    dropCard(card: ICard, pile: IPile): Generator<DelayHint, void>;

    /** Serialize the game's state to a string. */
    serialize(): string;

    /** Deserialize the game's state from a string. */
    deserialize(value: string): boolean;
}
