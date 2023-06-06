import { Colour } from "./Colour";
import { IPile } from "./IPile";
import { Rank } from "./Rank";
import { Suit } from "./Suit";

export interface ICard {
    /** The suit of the card. */
    readonly suit: Suit;

    /** The colour of the card. */
    readonly colour: Colour;

    /** The rank of the card. */
    readonly rank: Rank;

    /** The pile the card is currently in. A card can only be in one pile at a time. */
    readonly pile: IPile;

    /** The index of the card within the current pile. */
    readonly pileIndex: number;

    /** Whether the card is face up or not. */
    readonly faceUp: boolean;

    /** The card has been moved to a pile. PileIndex will probably have changed too. */
    pileChanged: () => void;

    /** The card has been moved to a new index within it's current pile. */
    pileIndexChanged: () => void;

    /** The card has been flipped. */
    faceUpChanged: () => void;
}
