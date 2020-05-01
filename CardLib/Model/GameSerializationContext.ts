import { Debug } from "~CardLib/Debug";
import { TypeEx } from "~CardLib/TypeEx";
import { AutoIdMap } from "../AutoIdMap";
import { Card } from "./Card";
import { Pile } from "./Pile";

export class GameSerializationContext {
    private data_: number[] = [];
    private dataIndex_ = 0;

    public write(value: number) {
        this.dataIndex_ = this.data_.push(value);
    }

    public read() {
        return this.data_[this.dataIndex_++];
    }

    public readRange(min: number, max: number) {
        const value = this.read();
        if (value >= min && value <= max)
            return value;
        throw new Error(`Value ${value} not in range [${min}, ${max}].`);
    }

    public toJson() {
        return JSON.stringify(this.data_);
    }

    public fromJson(json: string) {
        const data = JSON.parse(json);
        TypeEx.ensureArray(data);
        for (const v of data) {
            TypeEx.ensureNumber(v);
        }
        this.data_ = data;
        this.dataIndex_ = 0;
    }

    public ensureAtEnd() {
        if (this.dataIndex_ !== this.data_.length)
            throw new Error();
    }

    private readonly cardMap_ = new AutoIdMap<Card>();

    public addCard(card: Card) {
        return this.cardMap_.add(card);
    }

    public getCard(cardId: number) {
        return this.cardMap_.get(cardId);
    }

    public getCardId(card: Card) {
        return this.cardMap_.getId(card);
    }

    private readonly pileMap_ = new AutoIdMap<Pile>();

    public addPile(pile: Pile) {
        return this.pileMap_.add(pile);
    }

    public getPile(pileId: number) {
        return this.pileMap_.get(pileId);
    }

    public getPileId(pile: Pile) {
        return this.pileMap_.getId(pile);
    }
}


