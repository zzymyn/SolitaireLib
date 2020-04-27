import { Card } from "./Card";
import { Colour } from "./Colour";
import { Rank } from "./Rank";
import { Suit } from "./Suit";
import { Pile } from "./Pile";

const s52SuitColours: [Suit, Colour][] = [[Suit.Spades, Colour.Black], [Suit.Hearts, Colour.Red], [Suit.Diamonds, Colour.Red], [Suit.Clubs, Colour.Black]];
const s52Ranks: Rank[] = [Rank.Ace, Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King];

export class DeckUtils {
    public static createStandard52Deck(pile: Pile): Card[] {
        let deck: Card[] = [];
        for (const [suit, colour] of s52SuitColours) {
            for (const rank of s52Ranks) {
                let card = pile.createCard(suit, colour, rank);
                deck.push(card);
            }
        }

        return deck;
    }
}