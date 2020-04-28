import { ICard } from "./ICard";

export interface IPile {
    /** The number of cards in this pile. */
    length: number;

    /** Get the card in the pile by index. */
    at(index: number): ICard;

    /** Get the top card in this pile. */
    peek(): ICard | undefined;

    /** Find the index of a card in this pile. */
    indexOf(card: ICard): number;

    /** Contents of the pile has changed. */
    cardsChanged: () => void;
}