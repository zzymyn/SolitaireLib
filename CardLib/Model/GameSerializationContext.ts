import { error } from "~CardLib/Debug";
import { ensureNumberArray } from "~CardLib/TypeEx";
import { AutoIdMap } from "../AutoIdMap";
import { Card } from "./Card";
import { Pile } from "./Pile";
import { IUndoableOperation } from "./Undoable/IUndoableOperation";

type UndoableDeserializer = (context: GameSerializationContext) => IUndoableOperation;

export class GameSerializationContext {
    private data_: number[] = [];
    private dataIndex_ = 0;

    public write(value: number) {
        this.dataIndex_ = this.data_.push(value);
    }

    public writeBool(value: boolean) {
        return this.write(value ? 1 : 0);
    }

    public writeCard(card: Card) {
        this.write(this.getCardId(card));
    }

    public writePile(pile: Pile) {
        this.write(this.getPileId(pile));
    }

    public writeUndoable(undoable: IUndoableOperation) {
        this.writeUndoableDeserializer_(undoable.deserializer);
        undoable.serialize(this);
    }

    private writeUndoableDeserializer_(undoable: UndoableDeserializer) {
        this.write(this.getUndoableDeserializerId(undoable));
    }

    public read() {
        return this.data_[this.dataIndex_++] ?? error();
    }

    public readRange(min: number, max: number) {
        const value = this.read();
        if (value >= min && value <= max) return value;
        throw new Error(`Value ${value} not in range [${min}, ${max}].`);
    }

    public readBool() {
        return this.readRange(0, 1) !== 0;
    }

    public readCard() {
        return this.getCard(this.read());
    }

    public readPile() {
        return this.getPile(this.read());
    }

    public readUndoable() {
        const deserializer = this.readUndoableDeserializer_();
        return deserializer(this);
    }

    private readUndoableDeserializer_() {
        return this.getUndoableDeserializer(this.read());
    }

    public toJson() {
        return JSON.stringify(this.data_);
    }

    public fromJson(json: string) {
        const data: unknown = JSON.parse(json);
        ensureNumberArray(data);
        this.data_ = data;
        this.dataIndex_ = 0;
    }

    public ensureAtEnd() {
        if (this.dataIndex_ !== this.data_.length) throw new Error("Deserialization did not consume all data.");
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

    private readonly undoableDeserializerMap_ = new AutoIdMap<UndoableDeserializer>();

    public addUndoableDeserializer(undoable: UndoableDeserializer) {
        return this.undoableDeserializerMap_.add(undoable);
    }

    public getUndoableDeserializer(undoableId: number) {
        return this.undoableDeserializerMap_.get(undoableId);
    }

    public getUndoableDeserializerId(undoable: UndoableDeserializer) {
        return this.undoableDeserializerMap_.getId(undoable);
    }
}
